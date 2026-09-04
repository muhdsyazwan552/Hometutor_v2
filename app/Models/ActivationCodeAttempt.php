<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ActivationCodeAttempt extends Model
{
    public const UPDATED_AT = null;

    protected $fillable = ['activation_code_id', 'code_fingerprint', 'code_last_four', 'actor_user_id', 'action', 'result', 'ip_address', 'user_agent', 'metadata'];

    protected function casts(): array
    {
        return ['metadata' => 'array'];
    }

    public function activationCode()
    {
        return $this->belongsTo(ActivationCode::class);
    }
}
