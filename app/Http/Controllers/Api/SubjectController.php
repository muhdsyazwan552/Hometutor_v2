<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;

use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class SubjectController extends Controller
{

    public function progress($subject)
{
    return response()->json([
        "percentage" => 16,
        "skills" => [
            "mastered" => 0,
            "proficient" => 0,
            "familiar" => 1,
            "practiced" => 3,
            "needPractice" => 4,
        ],
        "topics" => [
            [ "title" => "Penyiasatan Saintifik", "color" => "#a5f3fc" ],
            [ "title" => "Koordinasi Badan", "color" => "#a5f3fc" ],
            [ "title" => "Keturunan Dan Variasi", "color" => "#a5f3fc" ],
            [ "title" => "Jirim Dan Bahan", "color" => "#a5f3fc" ],
            [ "title" => "Tenaga Dan Perubahan Kimia", "color" => "#a5f3fc" ],
            [ "title" => "Tenaga Nuklear", "color" => "#a5f3fc" ],
            [ "title" => "Cahaya, Warna Dan Penglihatan", "color" => "#a5f3fc" ],
        ]
    ]);
}
    public function skills($subject)
{
    return response()->json([
        ["name" => "Penyiasatan Saintifik"],
        ["name" => "Koordinasi Badan"],
        ["name" => "Keturunan Dan Variasi"],
        ["name" => "Jirim Dan Bahan"],
        ["name" => "Tenaga Dan Perubahan Kimia"],
        ["name" => "Tenaga Nuklear"],
        ["name" => "Cahaya, Warna Dan Penglihatan"],
        ["name" => "Bahan Kimia Dalam Perindustrian"],
    ]);
}

public function challenge($subject)
{
    return response()->json([
        "title" => "Mastery Challenge",
        "description" => "Strengthen skills you've already practiced"
    ]);
}

}
