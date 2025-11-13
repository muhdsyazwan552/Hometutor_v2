<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Subject extends Model
{
    use HasFactory;

    protected $table = 'subject';
    protected $primaryKey = 'id';
    public $timestamps = true;

    protected $fillable = [
        'old_id',
        'group_id',
        'abbr',
        'name',
        'level_id',
        'seq',
        'is_active',
        'modified_by',
        'created_by',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /** Relationships */
    public function topics()
    {
        return $this->hasMany(Topic::class, 'subject_id', 'id');
    }
}
