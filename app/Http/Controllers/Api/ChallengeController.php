<?php


namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

class ChallengeController extends Controller
{
    public function getQuestion($subject)
    {
        // Example hardcoded data (same structure you provided)
        return response()->json([
            "question" => [
                "id" => "70808",
                "question" => "Cari persamaan garis lurus yang melalui dua titik P(-1, 3) dan Q(½ , 0).",
            ],
            "answer" => [
                ["id" => "277435", "answer_option" => "y = 2x + 1", "is_correct_answer" => "0"],
                ["id" => "277437", "answer_option" => "y = -2x + 1", "is_correct_answer" => "1"],
                ["id" => "277436", "answer_option" => "y = 2x – 1", "is_correct_answer" => "0"],
                ["id" => "277438", "answer_option" => "y = -2x – 1", "is_correct_answer" => "0"],
            ]
        ]);
    }
}
