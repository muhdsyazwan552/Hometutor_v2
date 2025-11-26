<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

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
        'code',
        'school_id',
        'ic_number',
        'full_name',
        'level_id',
    ];

    /**
     * Get the user that owns the student.
     */
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id', 'id');
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