<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MailLog extends Model
{
    protected $fillable = ['user_id', 'to', 'type', 'subject', 'status', 'is_test', 'error'];

    protected $casts = ['is_test' => 'boolean'];

    public const STATUS = ['sent' => 'أُرسلت', 'failed' => 'فشلت', 'disabled' => 'متوقفة'];
}
