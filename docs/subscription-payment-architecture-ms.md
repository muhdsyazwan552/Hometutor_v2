# Reka Bentuk Subscription, Payment dan Cart HomeTutor

> Status: Nota reka bentuk — belum dilaksanakan sepenuhnya.  
> Dikemas kini: 3 September 2026.

## Tujuan dan keputusan utama

Dokumen ini merekodkan reka bentuk bagi pembelian pakej, pembaharuan langganan, activation code, pembayaran online dan cart.

- Satu ibu bapa boleh membayar untuk ramai anak melalui satu payment.
- Satu item cart mewakili satu anak + satu pakej + satu tempoh.
- Akaun anak baharu hanya dicipta selepas pembayaran online disahkan oleh payment gateway.
- Setiap item order menghasilkan satu rekod `child_subscriptions`.
- Pembaharuan mencipta rekod baharu; rekod lama tidak ditimpa atau dipadam.
- Callback berulang tidak boleh mencipta akaun atau subscription berganda.

## Sistem semasa

Checkout semasa hanya menyokong **satu anak bagi satu pembayaran**:

```text
Pilih pakej + level + tempoh
→ Masukkan username/password seorang anak
→ Payment
→ Satu akaun anak
→ Satu child_subscriptions
```

`PackageCheckoutService` semasa menggunakan provider `internal_submit` dan terus menyimpan payment sebagai `paid`. Ia belum merupakan integrasi payment gateway sebenar kerana belum ada redirect gateway, pengesahan server-to-server, status `pending`, atau pengendalian notifikasi berulang.

Jadual semasa yang penting:

| Jadual | Fungsi |
|---|---|
| `users` | Akaun ibu bapa dan anak |
| `students` | Profil anak dan hubungan ibu bapa |
| `packages` | Pakej pembelajaran |
| `package_duration_options` | Tempoh dan harga pakej |
| `package_level` | Level yang disokong pakej |
| `package_payments` | Rekod payment semasa, satu pakej sahaja |
| `activation_codes` | Kod sekali guna baharu/renewal |
| `activation_code_attempts` | Audit activation code |
| `child_subscriptions` | Tempoh akses anak; sumber utama akses |

Jadual `subscriptions` lama tidak patut digunakan untuk logik langganan baharu.

## Cart masa hadapan

```text
Order parent
├── Item 1: Anak baharu Ali + Standard 1 + 6 bulan
├── Item 2: Anak baharu Siti + Standard 3 + 12 bulan
└── Item 3: Renew anak Amin + Standard 2 + 6 bulan

Satu pembayaran online
└── Tiga subscription dipenuhi selepas payment disahkan
```

Satu payment tidak bermaksud satu subscription. Satu payment boleh mempunyai banyak `order_items`, dan setiap item yang berjaya dipenuhi menghasilkan satu `child_subscriptions`.

## Akaun anak baharu dalam keadaan pending

Untuk item `new`, simpan data sementara dalam `order_items` ketika order masih `pending_payment`:

```text
new_child_name
new_child_username
new_child_password_hash
new_child_level_id
new_child_class_name
```

Kata laluan tidak boleh disimpan sebagai plain text; hanya password hash dibenarkan.

Selepas pengesahan payment gateway yang sah:

1. Cipta `users` untuk anak.
2. Cipta `students` dan hubungkan dengan ibu bapa.
3. Cipta `child_subscriptions`.
4. Tandakan item sebagai `fulfilled`.

Untuk mengelakkan username diambil sebelum payment selesai, tambah jadual `username_reservations`:

```text
id
username (unique)
order_item_id
expires_at
released_at
```

Reservation perlu tamat secara automatik jika payment tidak siap dalam tempoh yang ditetapkan.

## Jadual baharu yang dicadangkan

### `orders`

Satu checkout parent, dengan jumlah keseluruhan.

```text
id
uuid
order_number (unique)
parent_id
status
currency
subtotal_amount
discount_amount
tax_amount
total_amount
provider
expires_at
paid_at
cancelled_at
created_at
updated_at
```

Status order:

```text
draft | pending_payment | paid | failed | cancelled | expired | partially_refunded | refunded
```

### `order_items`

Satu anak + satu pakej + satu tempoh bagi setiap item.

```text
id
uuid
order_id
item_type                 new | renewal
fulfillment_status        pending | fulfilled | failed | cancelled

child_user_id             nullable, untuk renewal
new_child_name            nullable, untuk akaun baharu
new_child_username        nullable
new_child_password_hash   nullable
new_child_level_id        nullable
new_child_class_name      nullable

package_id
package_duration_option_id
package_name_snapshot
duration_days_snapshot
unit_amount
discount_amount
tax_amount
total_amount

fulfilled_child_user_id   nullable
fulfilled_at              nullable
failure_reason            nullable
created_at
updated_at
```

Peraturan server:

- Item `new` perlu mempunyai data anak baharu.
- Item `renewal` perlu mempunyai `child_user_id` yang dimiliki parent order.
- Pakej perlu menyokong level anak.
- Jangan benarkan dua renewal terbuka untuk anak sama tanpa sebab yang diluluskan.
- Harga, tempoh, package dan level mesti disahkan semula di server.

### `payment_transactions`

Satu order boleh mempunyai beberapa cubaan payment; contoh cubaan pertama gagal dan cubaan kedua berjaya.

```text
id
uuid
order_id
provider                 nama payment gateway
provider_order_id        unique
provider_transaction_id  unique, nullable sebelum callback
status
amount
currency
payment_channel
gateway_message
paid_at
failed_at
fulfilled_at
raw_response_metadata
created_at
updated_at
```

Status transaction:

```text
pending | processing | paid | failed | cancelled | refunded
```

### `payment_callback_events`

Setiap callback perlu disimpan untuk audit dan pengesanan event pendua.

```text
id
payment_transaction_id
provider
order_number
provider_transaction_id
status_received
signature_valid
payload
received_at
processed_at
processing_result
error_message
```

### `child_subscriptions`

Kekalkan jadual ini sebagai rekod tempoh akses anak. Tambah:

```text
subscription_type         new | renewal
source                    online_payment | activation_code | admin_manual | legacy
order_item_id             nullable
payment_transaction_id    nullable
cancelled_at              nullable
cancellation_reason       nullable
```

Medan yang sudah ada dan perlu dikekalkan:

```text
child_user_id
package_id
activation_code_id
previous_subscription_id
status
starts_at
ends_at
```

Status subscription:

```text
scheduled | active | expired | cancelled
```

| Status | Maksud |
|---|---|
| `scheduled` | Renewal telah dibayar tetapi subscription lama masih berjalan |
| `active` | Akses pembelajaran aktif |
| `expired` | Tempoh akses tamat |
| `cancelled` | Akses dibatalkan secara sah |

Akses sebenar mestilah memeriksa tarikh juga:

```text
status = active
starts_at <= sekarang
ends_at > sekarang
```

## Aliran online payment

### 1. Checkout

```text
Cart parent
→ server sahkan semua item
→ order dicipta sebagai pending_payment
→ payment_transactions dicipta sebagai pending
→ provider_order_id unik dijana
→ pengguna di-redirect ke payment gateway
```

### 2. Return URL

Return URL hanya memaparkan keadaan kepada pengguna:

```text
Payment sedang disahkan / berjaya / gagal
```

Return URL bukan sumber kebenaran untuk mencipta subscription kerana pengguna boleh menutup browser atau parameter URL boleh dipalsukan.

### 3. Callback URL

Notifikasi server-to-server daripada payment gateway ialah sumber pengesahan payment pada server:

```text
Callback diterima
→ cari payment menggunakan order_id
→ sahkan SHA-256/HMAC hash
→ sahkan amount dan currency dengan rekod lokal
→ simpan callback event
→ lock order dan transaction
→ proses item yang belum fulfilled sahaja
→ balas OK
```

Payment gateway boleh menghantar notifikasi lebih daripada sekali. Endpoint perlu mengesahkan signature mengikut dokumentasi gateway, merekodkan setiap notifikasi, dan tidak mencipta rekod baharu jika payment sudah dipenuhi.

Gunakan algoritma signature moden yang disokong oleh gateway, contohnya SHA-256 atau HMAC-SHA256. Jangan gunakan MD5 untuk integrasi baharu.

### 4. Fulfilment

Fulfilment mesti berlaku dalam satu database transaction:

```text
Lock order dan payment
→ pastikan status payment = paid
→ untuk setiap order item yang belum fulfilled:
   ├─ new: cipta user dan student
   ├─ renewal: lock anak/langganan terakhir
   ├─ cipta child_subscription melalui SubscriptionService
   └─ tandakan item fulfilled
→ isi fulfilled_at
→ commit
```

Jika callback yang sama diterima semula dan `fulfilled_at` sudah wujud, jangan cipta user atau subscription lagi; balas `OK`.

## Aliran renewal

### Renew melalui online payment

```text
Parent pilih anak sedia ada
→ pilih package/tempoh
→ tambah renewal item dalam cart
→ bayar melalui payment gateway
→ pengesahan server-to-server sah
→ SubscriptionService mencipta subscription baharu
```

Jika subscription lama masih aktif:

```text
starts_at baharu = ends_at subscription terakhir
ends_at baharu = starts_at baharu + duration_days
status baharu = scheduled
```

Jika sudah tamat:

```text
starts_at baharu = sekarang
ends_at baharu = sekarang + duration_days
status baharu = active
```

`previous_subscription_id` perlu menunjuk kepada rekod sebelumnya. Semasa renew, lock rekod anak/langganan terakhir supaya dua payment serentak tidak menghasilkan tempoh bertindih.

### Renew melalui activation code

```text
Code Manager/pentadbir keluarkan code renewal
→ intended_use = renewal
→ renewal_child_id dikunci kepada anak tertentu
→ parent atau anak tebus code
→ code disahkan
→ SubscriptionService cipta renewal subscription
→ code ditanda redeemed
```

Activation code ialah saluran manual. Ia tidak perlu dijana untuk online payment.

## SubscriptionService pusat

Tambah `SubscriptionService` supaya logik tempoh berada di satu tempat dan digunakan oleh online payment, activation code serta admin manual.

Fungsi yang dicadangkan:

```php
grantNewChildSubscription(...)
grantRenewalSubscription(...)
activeSubscriptionForChild(...)
expireDueSubscriptions(...)
cancelSubscription(...)
```

```text
Online payment → SubscriptionService → child_subscriptions
Activation code → ActivationCodeService → SubscriptionService → child_subscriptions
Admin manual → SubscriptionService → child_subscriptions
```

## Activation code

Kekalkan maklumat berikut dalam `activation_codes`:

```text
package_id
purchaser_parent_id
renewal_child_id
intended_use             new | renewal | any
duration_days
status                   unused | redeemed | revoked | expired
expires_at
redeemed_at
redeemed_by_child_id
```

Kawalan penting:

- Kod sekali guna.
- Kod renewal hanya boleh digunakan oleh anak yang ditetapkan.
- Kod perlu padan dengan parent, package dan level.
- Semua generate/validate/redeem direkodkan dalam `activation_code_attempts`.
- Kod boleh direvoke jika payment berkaitan dibatalkan atau direfund sebelum ditebus.
- Kod penuh tidak boleh dihantar kepada Website B atau masuk ke log.

## Refund, cancellation dan chargeback

Jangan padam payment atau subscription selepas refund. Simpan sejarah audit.

```text
Permintaan refund
→ semak polisi dan kelayakan
→ lulus/tolak oleh pentadbir
→ refund gateway berjaya
→ payment = refunded
→ subscription berkaitan = cancelled
→ simpan refund reference dan cancellation reason
```

Sebelum membatalkan subscription, semak sama ada terdapat renewal `scheduled` selepasnya. Polisi perniagaan perlu menentukan sama ada renewal itu diteruskan, dibatalkan atau disemak secara manual.

## Scheduled jobs dan notifikasi

Job berkala:

```text
scheduled + starts_at <= sekarang → active
active + ends_at <= sekarang → expired
```

Pemeriksaan akses tetap perlu menggunakan `starts_at` dan `ends_at` secara langsung jika scheduler lewat.

Notifikasi disyorkan:

- 30 hari, 7 hari dan 1 hari sebelum tamat.
- Pada hari tamat.
- Payment berjaya atau gagal.
- Renew berjaya.
- Refund/cancellation selesai.

## One-time payment dan auto-renew

Cadangan awal untuk HomeTutor ialah **one-time payment bagi setiap renew**:

```text
Parent pilih child → pilih package/tempoh → bayar → payment disahkan → extend subscription
```

Ini paling sesuai untuk cart yang mempunyai banyak anak dan package/tempoh yang berbeza.

Jika mahu auto-renew kemudian, gunakan fungsi recurring daripada payment gateway yang dipilih. Tambah medan berikut:

```text
provider_subscription_id
provider_recurring_id
auto_renew
next_billing_at
cancel_at_period_end
```

Recurring memerlukan pengurusan gagal caj, retry, cancellation dan notifikasi recurring. Ia tidak perlu dibina pada fasa awal jika ibu bapa masih memilih renew secara manual.

## Integrasi Website B

Website B hanya menerima hasil akhir subscription, bukan data payment atau activation code.

```json
{
  "uuid": "...",
  "child_uuid": "...",
  "subscription_type": "renewal",
  "source": "online_payment",
  "status": "active",
  "effective_status": "active",
  "starts_at": "...",
  "ends_at": "...",
  "updated_at": "..."
}
```

Jangan hantar data berikut kepada Website B:

```text
Secret key payment gateway
Kad/token payment
Callback payload penuh
Activation code
Maklumat refund dalaman
```

## Keselamatan

- Simpan merchant ID dan secret key payment gateway hanya dalam `.env`.
- Jangan masukkan secret key ke JavaScript, URL atau log.
- Gunakan HTTPS bagi return dan callback URL production.
- Sahkan hash callback sebelum menukar apa-apa status.
- Guna `hash_equals()` untuk hash/signature.
- Jangan percaya `amount`, `package_id`, `duration` atau `child_user_id` daripada browser.
- Jangan simpan data kad.
- Gunakan database transaction dan row locking bagi callback serta renewal.
- Hadkan rate untuk create order dan tebus activation code.

## Pelan pelaksanaan

1. Tambah jadual `orders`, `order_items`, `payment_transactions`, `payment_callback_events` dan pilihan `username_reservations`.
2. Tambah `subscription_type`, `source`, hubungan order/payment dan status `scheduled` kepada `child_subscriptions`.
3. Cipta `SubscriptionService` dan pindahkan logik pengiraan renewal ke dalamnya.
4. Bina cart parent dan checkout untuk banyak anak.
5. Tambah integrasi payment gateway: pending order, redirect, return URL, notifikasi server-to-server dan pengesahan signature.
6. Jadikan notifikasi payment idempotent dan tambah reconciliation job menggunakan API query status gateway jika notifikasi tidak diterima.
7. Tambah scheduler expiry, reminder, refund/cancellation dan audit dashboard.
8. Kemas kini Integration API Website B dengan `subscription_type`, `source` dan `effective_status`.

## Kriteria siap

- Parent boleh bayar beberapa anak dalam satu payment.
- Callback paid mencipta semua akaun/subscription yang sepatutnya sekali sahaja.
- Callback pendua tidak menghasilkan rekod pendua.
- Payment gagal tidak memberi akses.
- Renew sebelum tamat menyambung tempoh tanpa overlap.
- Renew selepas tamat bermula daripada masa payment disahkan.
- Activation code baharu dan renewal menggunakan SubscriptionService yang sama.
- Refund/cancellation menyimpan sejarah audit.
- Website B menerima status subscription yang tepat tanpa data payment sensitif.
