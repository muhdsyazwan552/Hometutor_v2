<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Http\Requests\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\File;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user();
        $student = $user->student; // Assuming one-to-one: User hasOne Student

        return Inertia::render('Profile/Edit', [
            'mustVerifyEmail' => $user instanceof MustVerifyEmail,
            'status' => session('status'),
            'student' => $student ? [
                'id' => $student->id,
                'full_name' => $student->full_name,
                'code' => $student->code,
                'ic_number' => $student->ic_number,
                'class_name' => $student->class_name,
                'level_id' => $student->level_id,
                'profile_picture' => $student->profile_picture
                    ? asset('storage/' . $student->profile_picture)
                    : null,
            ] : null,
        ]);
    }

    /**
     * Update the user's profile information (name, email, etc.)
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        return Redirect::route('profile.edit')->with('status', 'profile-updated');
    }

    /**
     * Delete the user's account.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();
        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return Redirect::to('/');
    }

    /**
     * Get list of available avatar filenames from public/avatars
     */
    private function getAvailableAvatars(): array
    {
        $avatarPath = public_path('avatars');

        if (!is_dir($avatarPath)) {
            return [];
        }

        $files = File::files($avatarPath);

        $allowedExtensions = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'];

        return collect($files)
            ->filter(fn($file) => in_array(strtolower($file->getExtension()), $allowedExtensions))
            ->map->getFilename()
            ->values()
            ->toArray();
    }

    /**
     * Update Student's Profile Picture (Upload or Choose Avatar)
     */
    public function updateProfilePicture(Request $request): RedirectResponse
{
    $request->validate([
        'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:3072',
        'avatar_filename' => 'nullable|string|in:' . implode(',', $this->getAvailableAvatars()),
    ]);

    $user = $request->user();

    if (!$user->student) {
        return back()->with('error', 'Student profile not found.');
    }

    $student = $user->student;
    $oldPath = $student->profile_picture;
    $newPath = null;

    try {
        if ($request->hasFile('profile_picture')) {
            // Upload custom photo
            Storage::disk('public')->makeDirectory('student_avatars'); // optional, storeAs will create it

            $file = $request->file('profile_picture');
            $filename = 'custom_' . $user->id . '_' . Str::random(10) . '.' . $file->getClientOriginalExtension();
            $newPath = $file->storeAs('student_avatars', $filename, 'public');
        }
        elseif ($request->filled('avatar_filename')) {
            $filename = $request->avatar_filename;
            $source = public_path('avatars/' . $filename);

            if (!file_exists($source)) {
                return back()->with('error', 'Selected avatar not found.');
            }

            // Create directory and copy file
            Storage::disk('public')->makeDirectory('student_avatars');

            $extension = pathinfo($filename, PATHINFO_EXTENSION);
            $newFilename = 'avatar_' . $user->id . '_' . Str::random(8) . '.' . $extension;
            $newPath = 'student_avatars/' . $newFilename;

            // THIS LINE WAS MISSING — NOW FIXED
            Storage::disk('public')->put($newPath, file_get_contents($source));
        }

        if (!$newPath) {
            return back()->with('error', 'No image or avatar selected.');
        }

        // Delete old image
        if ($oldPath && Storage::disk('public')->exists($oldPath)) {
            if (str_starts_with(basename($oldPath), 'custom_') || str_starts_with(basename($oldPath), 'avatar_')) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $student->profile_picture = $newPath;
        $student->save();

        return back()->with('success', 'Profile picture updated successfully!');
    } catch (\Exception $e) {
        return back()->with('error', 'Failed to update profile picture: ' . $e->getMessage());
    }
}
}