<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Session;
use Illuminate\Validation\Rule;

class LanguageController extends Controller
{
    public function change(Request $request)
    {
        $validated = $request->validate([
            'locale' => ['required', 'string', Rule::in(['en', 'ms'])],
        ]);

        $locale = $validated['locale'];
        Session::put('locale', $locale);

        if ($request->user()) {
            DB::table('users')->where('id', $request->user()->id)->update(['language' => $locale]);
        }

        return back();
    }
}
