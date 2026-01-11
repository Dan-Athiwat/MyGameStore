const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// ตั้งค่าที่เก็บไฟล์ (จะสร้างโฟลเดอร์ uploads อัตโนมัติ)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());
app.use(express.static('public')); // ให้บริการหน้าเว็บ
app.use('/uploads', express.static('uploads')); // ให้ดาวน์โหลดไฟล์ได้

// จำลองฐานข้อมูล (ใช้ตัวแปรแทน Database จริง เพื่อความง่าย)
let games = [];
let users = [];

// API: เช็คชื่อผู้ใช้ / สมัครใหม่
app.post('/api/login', (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: "กรุณาใส่ชื่อผู้ใช้" });
    
    // ในระบบจริงต้องเช็ค Session แต่ที่นี่เราเช็คแค่ชื่อซ้ำในระบบง่ายๆ
    if (!users.includes(username)) {
        users.push(username);
    }
    res.json({ status: "ok", username });
});

// API: อัปโหลดเกม
app.post('/api/upload', upload.fields([
    { name: 'pcFile', maxCount: 1 },
    { name: 'mobileFile', maxCount: 1 },
    { name: 'image', maxCount: 1 }
]), (req, res) => {
    const { name, version, desc, uploader } = req.body;
    const files = req.files;

    const newGame = {
        id: Date.now(),
        name,
        version,
        desc,
        uploader,
        image: files.image ? `/uploads/${files.image[0].filename}` : null,
        pcFile: files.pcFile ? `/uploads/${files.pcFile[0].filename}` : null,
        mobileFile: files.mobileFile ? `/uploads/${files.mobileFile[0].filename}` : null,
        downloads: 0
    };

    games.push(newGame);
    res.json({ status: "success", game: newGame });
});

// API: ดึงรายชื่อเกมทั้งหมด
app.get('/api/games', (req, res) => {
    const { search } = req.query;
    if (search) {
        // ค้นหาแบบใกล้เคียง (Case insensitive)
        const filtered = games.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
        return res.json(filtered);
    }
    res.json(games);
});

app.listen(PORT, () => {
    console.log(`Server เปิดแล้วที่ http://localhost:${PORT}`);
    console.log(`หากเพื่อนจะเข้า ให้ใช้ IP ของเครื่องคุณ เช่น http://192.168.1.X:${PORT}`);
});