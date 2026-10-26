<?php

namespace App\Support;

use Illuminate\Support\Facades\Http;

/**
 * Minimal Web Push sender (RFC 8291 aes128gcm payload encryption + RFC 8292 VAPID), no extra packages.
 * Keys: VAPID_PUBLIC_KEY (base64url, 65-byte uncompressed P-256 point) and VAPID_PRIVATE_KEY (base64url, 32-byte scalar).
 */
class WebPush
{
    public static function b64e(string $s): string
    {
        return rtrim(strtr(base64_encode($s), '+/', '-_'), '=');
    }

    public static function b64d(string $s): string
    {
        return (string) base64_decode(strtr($s, '-_', '+/').str_repeat('=', (4 - strlen($s) % 4) % 4));
    }

    public static function publicKey(): ?string
    {
        return config('services.vapid.public') ?: null;
    }

    public static function configured(): bool
    {
        return (bool) (config('services.vapid.public') && config('services.vapid.private'));
    }

    /** @return array{public:string,private:string} */
    public static function generateKeys(): array
    {
        $k = openssl_pkey_new(['curve_name' => 'prime256v1', 'private_key_type' => OPENSSL_KEYTYPE_EC]);
        $d = openssl_pkey_get_details($k)['ec'];

        return ['public' => self::b64e("\x04".self::pad($d['x']).self::pad($d['y'])), 'private' => self::b64e(self::pad($d['d']))];
    }

    private static function pad(string $s): string
    {
        return str_pad($s, 32, "\0", STR_PAD_LEFT);
    }

    private static function publicPem(string $point): string
    {
        $der = hex2bin('3059301306072a8648ce3d020106082a8648ce3d030107034200').$point;

        return "-----BEGIN PUBLIC KEY-----\n".chunk_split(base64_encode($der), 64, "\n")."-----END PUBLIC KEY-----\n";
    }

    private static function privatePem(string $d, string $point): string
    {
        $der = hex2bin('30770201010420').$d.hex2bin('a00a06082a8648ce3d030107a144034200').$point;

        return "-----BEGIN EC PRIVATE KEY-----\n".chunk_split(base64_encode($der), 64, "\n")."-----END EC PRIVATE KEY-----\n";
    }

    /** DER ECDSA signature -> raw 64-byte r||s (JWS ES256). */
    private static function derToRaw(string $der): string
    {
        $o = 2;
        if (ord($der[1]) & 0x80) {
            $o += ord($der[1]) & 0x7F;
        }
        $out = '';
        for ($i = 0; $i < 2; $i++) {
            $len = ord($der[$o + 1]);
            $int = substr($der, $o + 2, $len);
            $out .= self::pad(ltrim($int, "\0"));
            $o += 2 + $len;
        }

        return $out;
    }

    public static function vapidHeader(string $endpoint): string
    {
        $u = parse_url($endpoint);
        $aud = $u['scheme'].'://'.$u['host'].(isset($u['port']) ? ':'.$u['port'] : '');
        $h = self::b64e(json_encode(['typ' => 'JWT', 'alg' => 'ES256']));
        $c = self::b64e(json_encode(['aud' => $aud, 'exp' => time() + 12 * 3600, 'sub' => config('services.vapid.subject', 'mailto:noreply@bustankids.com')]));
        $pub = self::b64d(config('services.vapid.public'));
        $key = openssl_pkey_get_private(self::privatePem(self::b64d(config('services.vapid.private')), $pub));
        openssl_sign("$h.$c", $sig, $key, OPENSSL_ALGO_SHA256);

        return 'vapid t='."$h.$c.".self::b64e(self::derToRaw($sig)).', k='.config('services.vapid.public');
    }

    /** RFC 8291 aes128gcm body for one subscription. */
    public static function encrypt(string $payload, string $p256dh, string $auth): string
    {
        $uaPub = self::b64d($p256dh);
        $authSecret = self::b64d($auth);
        $eph = openssl_pkey_new(['curve_name' => 'prime256v1', 'private_key_type' => OPENSSL_KEYTYPE_EC]);
        $ed = openssl_pkey_get_details($eph)['ec'];
        $asPub = "\x04".self::pad($ed['x']).self::pad($ed['y']);
        $shared = openssl_pkey_derive(openssl_pkey_get_public(self::publicPem($uaPub)), $eph, 32);
        $ikm = hash_hkdf('sha256', $shared, 32, "WebPush: info\0".$uaPub.$asPub, $authSecret);
        $salt = random_bytes(16);
        $cek = hash_hkdf('sha256', $ikm, 16, "Content-Encoding: aes128gcm\0", $salt);
        $nonce = hash_hkdf('sha256', $ikm, 12, "Content-Encoding: nonce\0", $salt);
        $ct = openssl_encrypt($payload."\x02", 'aes-128-gcm', $cek, OPENSSL_RAW_DATA, $nonce, $tag);

        return $salt.pack('N', 4096).chr(65).$asPub.$ct.$tag;
    }

    /** @return int HTTP status (201 = accepted; 404/410 = subscription gone). 0 = network error. */
    public static function send(string $endpoint, string $p256dh, string $auth, array $data, int $ttl = 43200): int
    {
        try {
            $r = Http::timeout(15)->withHeaders([
                'Authorization' => self::vapidHeader($endpoint),
                'Content-Encoding' => 'aes128gcm',
                'Content-Type' => 'application/octet-stream',
                'TTL' => (string) $ttl,
                'Urgency' => 'normal',
            ])->withBody(self::encrypt(json_encode($data, JSON_UNESCAPED_UNICODE), $p256dh, $auth), 'application/octet-stream')->post($endpoint);

            return $r->status();
        } catch (\Throwable $e) {
            report($e);

            return 0;
        }
    }
}
