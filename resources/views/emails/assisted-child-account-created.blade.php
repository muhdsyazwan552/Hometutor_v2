<!DOCTYPE html>
<html lang="en">
<body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a">
<div style="max-width:620px;margin:32px auto;background:#fff;border-radius:18px;padding:32px">
<h1 style="margin:0;color:#082c58">Child account created</h1>
<p style="line-height:1.7">Hello {{ $parent->name }}, a HomeTutor child account has been created and connected to your parent account.</p>
<div style="margin:22px 0;padding:18px;border-radius:14px;background:#e0f2fe">
<p style="margin:0 0 8px"><strong>Child name:</strong> {{ $child->name }}</p>
<p style="margin:0 0 8px"><strong>Username:</strong> {{ $child->username }}</p>
<p style="margin:0 0 8px"><strong>Password:</strong> {{ $childPassword }}</p>
<p style="margin:0 0 8px"><strong>Standard:</strong> {{ $child->student?->level?->name }}</p>
<p style="margin:0"><strong>Class:</strong> {{ $child->student?->class_name }}</p>
</div>
<h2 style="color:#082c58">Licence details</h2>
<p><strong>Package:</strong> {{ $activationCode->package->name }}</p>
<p><strong>Duration:</strong> {{ data_get($activationCode->metadata, 'duration_months') ?: round($activationCode->duration_days / (365 / 12)) }} months</p>
<p><strong>Access:</strong> {{ $subscription->starts_at->format('d M Y') }} to {{ $subscription->ends_at->format('d M Y') }}</p>
<p><strong>Activation code:</strong> {{ $activationCode->code_value }} (already redeemed)</p>
<p style="line-height:1.7;padding:12px;border-radius:10px;background:#fff7ed;color:#9a3412"><strong>Security reminder:</strong> This email contains the child password. Keep it private and ask the child to change it after signing in.</p>
</div>
</body>
</html>
