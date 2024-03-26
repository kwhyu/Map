const express = require("express");
const mysql = require("mysql");
const cors = require("cors");

const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// koneksi ke database MySQL
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "db_2105551150",
  port: 3306,
});

// Membuat koneksi ke database MySQL
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

// Konfigurasi multer untuk menangani unggahan gambar
const storage = multer.diskStorage({
  // destination: function (req, file, cb) {
  //   cb(null, 'uploads/'); // Menyimpan file di folder "uploads/"
  // },
  filename: function (req, file, cb) {
    cb(null, file.originalname); // Menggunakan nama file asli
  }
});

const upload = multer({ storage: storage });

// Menangani permintaan POST dari halaman HTML dengan menggunakan multer
app.post("/process", upload.single('gambar_rs'), (req, res) => {
  const { nama_rs, latlng_rs, tipe_rs, alamat_rs } = req.body;
  const gambar_rs = req.file ? fs.readFileSync(req.file.path) : null; // Membaca file gambar yang diunggah


  // Validasi data
  if (!nama_rs || !latlng_rs || !tipe_rs || !gambar_rs || !alamat_rs) {
    res.status(400).send('Data tidak lengkap');
    console.log('Data yang diterima:', req.body);
    return;
  }

  const sql = `INSERT INTO tb_rs (nama_rs, latlng_rs, tipe_rs, gambar_rs, alamat_rs) VALUES (?, ?, ?, ?, ?)`;
  const values = [nama_rs, latlng_rs, tipe_rs, gambar_rs, alamat_rs];

  connection.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      res.status(500).send("Internal Server Error");
      return;
    }
    console.log("Data inserted into database");
    console.log('Data yang diterima:', req.body);
    console.log('Data yang diterima:', req.file);
    res.send("Data inserted into database");
  });
});

// Menambahkan endpoint untuk mengambil data dari database
app.get("/getData", (req, res) => {
  // Query mengambil data dari tabel
  const sql = "SELECT * FROM tb_rs";

  // Eksekusi query
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    console.log("Data from MySQL:");
    console.log(results);

    res.json(results);
  });
});

// Endpoint untuk mengirimkan gambar dari database ke klien
app.get("/getImage/:id_rs", (req, res) => {
  const id = req.params.id_rs;
  const sql = "SELECT gambar_rs FROM tb_rs WHERE id_rs = ?";

  // Eksekusi query untuk mengambil gambar dari database
  connection.query(sql, [id], (err, results) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      res.status(500).send("Internal Server Error");
      return;
    }

    if (results.length === 0) {
      res.status(404).send("Image not found");
      return;
    }

    // Kirim gambar dalam format Base64 ke klien
    res.send(results[0].gambar_rs);
  });
});

// // Menangani permintaan POST dari halaman HTML
// app.post("/process", (req, res) => {
//   const { nama_rs, latlng_rs, tipe_rs, gambar_rs, alamat_rs } = req.body;

//   // Validasi data
//   if (!nama_rs || !latlng_rs || !tipe_rs || !gambar_rs || !alamat_rs) {
//     res.status(400).send('Data tidak lengkap');
//     console.log('Data yang diterima:', req.body);
//     return;
//   }

//   const sql = `INSERT INTO tb_rs (nama_rs, latlng_rs, tipe_rs, gambar_rs, alamat_rs) VALUES (?, ?, ?, ?, ?)`;
//   const values = [nama_rs, latlng_rs, tipe_rs, gambar_rs, alamat_rs];

//   connection.query(sql, values, (err, result) => {
//     if (err) {
//       console.error("Error executing SQL query:", err);
//       res.status(500).send("Internal Server Error");
//       return;
//     }
//     console.log("Data inserted into database");
//     console.log('Data yang diterima:', req.body);
//     res.send("Data inserted into database");
//   });
// });

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
