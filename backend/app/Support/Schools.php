<?php

namespace App\Support;

use App\Models\School;
use App\Models\SchoolSection;
use App\Models\Student;
use App\Models\User;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

/** Schools phase 1: accounts, sections, fast bulk student creation, PINs. */
class Schools
{
    public const EMAIL_DOMAIN = 'school.bustankids.invalid';

    public const SUBJECTS = ['math' => 'الرياضيات', 'arabic' => 'العربية', 'english' => 'الإنجليزية', 'science' => 'العلوم'];

    public static function pin(): string
    {
        do {
            $p = str_pad((string) random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        } while (preg_match('/^(\d)\1{3}$/', $p) || in_array($p, ['1234', '4321', '0123', '9876'], true));

        return $p;
    }

    /** Readable staff password: 10 chars, no look-alikes. */
    public static function password(): string
    {
        $a = 'abcdefghjkmnpqrstuvwxyz23456789';
        $out = '';
        for ($i = 0; $i < 10; $i++) {
            $out .= $a[random_int(0, strlen($a) - 1)];
        }

        return $out;
    }

    public static function username(string $prefix): string
    {
        $prefix = strtolower(preg_replace('/[^a-z0-9]/i', '', $prefix)) ?: 's';
        do {
            $u = substr($prefix, 0, 6).'-'.random_int(1000, 99999);
        } while (User::where('username', $u)->exists());

        return $u;
    }

    /** Manager or teacher. Returns [user, plain password] — the password is shown once and never stored in clear. */
    public static function createStaff(School $school, string $name, string $role): array
    {
        $username = self::username($school->slug);
        $password = self::password();
        $u = new User;
        $u->forceFill([
            'name' => mb_substr(trim($name), 0, 80), 'email' => $username.'@'.self::EMAIL_DOMAIN, 'password' => Hash::make($password),
            'role' => 'school', 'is_admin' => false, 'school_id' => $school->id, 'school_role' => $role, 'username' => $username,
            'email_verified_at' => now(),
        ])->save();

        return [$u, $password];
    }

    /**
     * One click: every name becomes a student (own hidden login holder, so progress/lessons work unchanged) with a 4-digit PIN.
     * Returns the created students.
     */
    public static function createStudents(SchoolSection $section, array $names): array
    {
        $school = $section->school;
        $made = [];
        $hash = Hash::make(Str::random(40)); // holders never sign in with a password (PIN only); one hash keeps bulk creation instant
        DB::transaction(function () use ($section, $school, $names, $hash, &$made) {
            foreach ($names as $name) {
                $username = self::username($school->slug);
                $u = new User;
                $u->forceFill([
                    'name' => $name, 'email' => $username.'@'.self::EMAIL_DOMAIN, 'password' => $hash,
                    'role' => 'school', 'is_admin' => false, 'school_id' => $school->id, 'school_role' => 'student', 'username' => $username,
                    'email_verified_at' => now(),
                ])->save();
                $s = new Student(['name' => $name, 'grade' => $section->grade, 'avatar' => 'idle']);
                $s->user_id = $u->id;
                $s->school_section_id = $section->id;
                self::assignPin($s, self::pin());
                $s->save();
                $made[] = $s;
            }
        });

        return $made;
    }

    public static function assignPin(Student $s, string $pin): void
    {
        $s->setPin($pin);
        $s->forceFill(['pin_enc' => Crypt::encryptString($pin), 'pin_fails' => 0, 'pin_locked_until' => null]);
    }

    public static function plainPin(Student $s): ?string
    {
        try {
            return $s->pin_enc ? Crypt::decryptString($s->pin_enc) : null;
        } catch (\Throwable) {
            return null;
        }
    }

    /** Names from pasted text or an uploaded CSV / XLSX (first non-empty cell of each row). Header-like rows are dropped. */
    /** Picker labels: first name + initial of the next name («أحمد م.»); longer only where needed to tell two children apart. */
    public static function shortNames(\Illuminate\Support\Collection $students): array
    {
        $words = $students->mapWithKeys(fn ($s) => [$s->id => preg_split('/\s+/u', trim((string) $s->name)) ?: ['']]);
        $label = function (array $w, int $level): string {
            if ($level === 0) {
                return $w[0].(isset($w[1]) ? ' '.mb_substr($w[1], 0, 1).'.' : '');
            }

            return implode(' ', array_slice($w, 0, $level + 1));
        };
        $out = [];
        foreach ($words as $id => $w) {
            $level = 0;
            while ($level < count($w) - 1 && $words->filter(fn ($o, $oid) => $oid !== $id && $label($o, $level) === $label($w, $level))->isNotEmpty()) {
                $level++;
            }
            $out[] = ['id' => $id, 'name' => $label($w, $level)];
        }

        return $out;
    }

    public static function parseNames(?string $text, ?\Illuminate\Http\UploadedFile $file = null): array
    {
        $rows = [];
        if ($text) {
            $rows = preg_split('/\r\n|\r|\n/', $text);
        }
        if ($file && $file->isValid()) {
            $ext = strtolower($file->getClientOriginalExtension());
            $rows = array_merge($rows, $ext === 'xlsx' ? self::xlsxFirstColumn($file->getRealPath()) : self::csvFirstColumn($file->getRealPath()));
        }
        $out = [];
        foreach ($rows as $r) {
            $r = trim(preg_replace('/[\x{200B}-\x{200F}\x{FEFF}]/u', '', (string) $r));
            $r = trim(preg_replace('/^\d+[\.\-\)]\s*/u', '', $r)); // "1. أحمد" / "1) أحمد"
            $r = preg_replace('/\s+/u', ' ', $r);
            if ($r === '' || mb_strlen($r) > 60 || in_array(mb_strtolower($r), ['الاسم', 'اسم الطالب', 'name', 'student', 'الأسماء'], true)) {
                continue;
            }
            $out[] = $r;
        }

        return array_slice(array_values(array_unique($out)), 0, 200);
    }

    private static function csvFirstColumn(string $path): array
    {
        $out = [];
        $raw = (string) file_get_contents($path, false, null, 0, 512000);
        $raw = preg_replace('/^\xEF\xBB\xBF/', '', $raw);
        if (! mb_check_encoding($raw, 'UTF-8')) {
            $raw = mb_convert_encoding($raw, 'UTF-8', 'Windows-1256');
        }
        foreach (preg_split('/\r\n|\r|\n/', $raw) as $line) {
            $cells = str_getcsv($line, str_contains($line, ';') && ! str_contains($line, ',') ? ';' : ',');
            foreach ($cells as $c) {
                if (trim((string) $c) !== '') {
                    $out[] = $c;
                    break;
                }
            }
        }

        return $out;
    }

    /** Minimal XLSX reader (no library): first sheet, first non-empty cell per row. */
    private static function xlsxFirstColumn(string $path): array
    {
        if (! class_exists(\ZipArchive::class)) {
            return [];
        }
        $z = new \ZipArchive;
        if ($z->open($path) !== true) {
            return [];
        }
        $shared = [];
        if (($ss = $z->getFromName('xl/sharedStrings.xml')) !== false) {
            $x = @simplexml_load_string($ss, 'SimpleXMLElement', LIBXML_NONET);
            foreach ($x?->si ?? [] as $si) {
                $t = '';
                if (isset($si->t)) {
                    $t = (string) $si->t;
                } else {
                    foreach ($si->r as $r) {
                        $t .= (string) $r->t;
                    }
                }
                $shared[] = $t;
            }
        }
        $sheet = $z->getFromName('xl/worksheets/sheet1.xml');
        $z->close();
        if ($sheet === false) {
            return [];
        }
        $x = @simplexml_load_string($sheet, 'SimpleXMLElement', LIBXML_NONET);
        $out = [];
        foreach ($x?->sheetData?->row ?? [] as $row) {
            foreach ($row->c as $c) {
                $type = (string) $c['t'];
                $v = $type === 's' ? ($shared[(int) $c->v] ?? '') : ($type === 'inlineStr' ? (string) $c->is->t : (string) $c->v);
                if (trim($v) !== '') {
                    $out[] = $v;
                    break;
                }
            }
        }

        return $out;
    }

    /** Sections a school user may manage: manager → whole school, teacher → own sections. */
    public static function sectionsFor(User $u)
    {
        $q = SchoolSection::where('school_id', $u->school_id);
        if ($u->school_role !== 'manager') {
            $q->whereHas('teachers', fn ($t) => $t->whereKey($u->id));
        }

        return $q->orderBy('grade')->orderBy('name');
    }
}
