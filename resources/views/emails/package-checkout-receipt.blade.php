<!DOCTYPE html>
<html lang="en">
<body style="margin:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a">
<div style="max-width:620px;margin:32px auto;background:#fff;border-radius:18px;padding:32px">
    <h1 style="margin:0;color:#082c58">Payment receipt</h1>
    <p style="line-height:1.7">Your HomeTutor child account and subscription are ready.</p>
    <div style="margin:22px 0;padding:18px;border-radius:14px;background:#e0f2fe">
        <p style="margin:0 0 8px"><strong>Receipt:</strong> {{ $payment->provider_reference }}</p>
        <p style="margin:0 0 8px"><strong>Package:</strong> {{ $payment->package->name }}</p>
        <p style="margin:0 0 8px"><strong>Duration:</strong> {{ $durationOption->months }} months</p>
        <p style="margin:0"><strong>Total:</strong> {{ $payment->currency }} {{ number_format($payment->amount, 2) }}</p>
    </div>
    <h2 style="color:#082c58">Child account</h2>
    <p><strong>Name:</strong> {{ $child->name }}</p>
    <p><strong>Username:</strong> {{ $child->username }}</p>
    <p><strong>Password:</strong> {{ $childPassword }}</p>
    <p><strong>Level:</strong> {{ $child->student?->level?->name }}</p>
    <p><strong>Access:</strong> {{ $subscription->starts_at->format('d M Y') }} to {{ $subscription->ends_at->format('d M Y') }}</p>
    <p style="line-height:1.7;padding:12px;border-radius:10px;background:#fff7ed;color:#9a3412"><strong>Security reminder:</strong> This email contains the child password. Keep it private and delete it after saving the login information securely.</p>
    <p><strong>Activation code:</strong> generated and redeemed automatically (ending {{ $activationCode->code_last_four }}).</p>
    <p style="font-size:13px;color:#64748b">Keep this email as your receipt. Contact HomeTutor support if any account detail is incorrect.</p>
</div>
</body>
</html>
