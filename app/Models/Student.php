<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class Student extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'students';

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'parent_id',
        'code',
        'school_id',
        'ic_number',
        'full_name',
        'level_id',
        'class_name',
<<<<<<< HEAD
        'profile_picture'
=======
        'profile_picture',
>>>>>>> 917d4bb (Initial project commit)
    ];

    protected static function booted(): void
    {
        static::creating(function (Student $student): void {
            $student->uuid ??= (string) Str::uuid();
        });
    }

    /**
     * Get the user that owns the student.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
    }

    public function parent()
    {
        return $this->belongsTo(User::class, 'parent_id');
    }

    /**
     * Get the school that the student belongs to.
     */
    public function school()
    {
        return $this->belongsTo(School::class, 'school_id', 'id');
    }

    /**
     * Get the level that the student belongs to.
     */
    public function level()
    {
        return $this->belongsTo(Level::class, 'level_id', 'id');
    }
}
