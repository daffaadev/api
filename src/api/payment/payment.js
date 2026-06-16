 const axios = require("axios")
const crypto = require("crypto")

const db = require("../../firebase")

const {
doc,
setDoc,
getDoc,
deleteDoc
} = require("firebase/firestore")

const APIKEY =
"jp_99b59faac0459bb3c24bc011e3ea"

module.exports = function(app) {

app.get("/payment", async (req, res) => {

const { action } = req.query

// ====================================
// CREATE PAYMENT
// ====================================

if (action === "create") {

try {

const nominal =
parseInt(req.query.nominal)

if (!nominal) {

return res.json({
status: false,
message: "Masukkan nominal"
})

}

const random =
Math.floor(Math.random() * 99) + 1

const amount = nominal + random

const trxid = crypto
.randomBytes(4)
.toString("hex")
.toUpperCase()

const { data } = await axios.get(
`https://jagopay.my.id/api.php?apikey=${APIKEY}&action=qris_dinamis&nominal=${amount}`
)

if (!data.status) {

return res.json({
status: false,
message: "Gagal membuat QRIS"
})

}

const qris =
data.data?.qris_url ||
data.data?.qr_image

// ====================================
// SAVE FIREBASE
// ====================================

await setDoc(
doc(db, "transactions", trxid),
{
trxid,
amount,
status: "PENDING",
expired: Date.now() + 300000
}
)

// ====================================
// RESPONSE
// ====================================

return res.json({
status: true,
result: {
trxid,
amount,
status: "PENDING",
expired: "5 Menit",
qris
}
})

} catch (e) {

console.log(e)

return res.json({
status: false,
message: "Internal server error"
})

}

}

// ====================================
// CHECK PAYMENT
// ====================================

if (action === "cekpay") {

try {

const trxid = req.query.trxid

if (!trxid) {

return res.json({
status: false,
message: "Masukkan trxid"
})

}

// ====================================
// GET FIREBASE
// ====================================

const trxRef =
doc(db, "transactions", trxid)

const trxSnap =
await getDoc(trxRef)

if (!trxSnap.exists()) {

return res.json({
status: false,
message: "Transaksi tidak ditemukan"
})

}

const trx = trxSnap.data()

// ====================================
// EXPIRED
// ====================================

if (Date.now() > trx.expired) {

await deleteDoc(trxRef)

return res.json({
status: false,
message: "Transaksi expired"
})

}

// ====================================
// GET MUTASI
// ====================================

const { data } = await axios.get(
`https://jagopay.my.id/api.php?apikey=${APIKEY}&action=qris_mutasi&page=1`
)

if (!data.status) {

return res.json({
status: false,
message: "Gagal mengambil mutasi"
})

}

const mutasi =
data.data?.mutasi || []

// ====================================
// MATCH PAYMENT
// ====================================

const cocok = mutasi.find(v => {

const kredit = parseInt(
String(v.kredit)
.replace(/\./g, "")
)

return kredit === trx.amount

})

// ====================================
// PENDING
// ====================================

if (!cocok) {

return res.json({
status: true,
result: {
trxid,
amount: trx.amount,
status: "PENDING"
}
})

}

// ====================================
// DELETE TRANSACTION
// ====================================

await deleteDoc(trxRef)

// ====================================
// SUCCESS
// ====================================

return res.json({
status: true,
result: {
trxid,
amount: trx.amount,
status: "PAID",
brand: cocok.brand?.name || "-",
tanggal: cocok.tanggal,
keterangan: cocok.keterangan
}
})

} catch (e) {

console.log(e)

return res.json({
status: false,
message: "Internal server error"
})

}

}

// ====================================
// INVALID ACTION
// ====================================

return res.json({
status: false,
message: "Action tidak valid"
})

})

}
