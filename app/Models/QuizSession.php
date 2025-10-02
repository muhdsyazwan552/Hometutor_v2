<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuizSession extends Model
{
    use HasFactory;

    protected $table = 'quiz_sessions';
    protected $primaryKey = 'id';

    protected $fillable = [
        'total_correct', 
        'total_time_seconds',
        'school_id', // Changed from school_name
        'display_name',
        'ic_number',
        'created_at',
        'updated_at'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'total_correct' => 'integer',
        'total_time_seconds' => 'integer',
        'school_id' => 'integer' // Add this cast
    ];

    public $timestamps = true;

    /**
     * Get the school that owns the quiz session.
     */
    public function school()
    {
        return $this->belongsTo(School::class, 'school_id');
    }
}