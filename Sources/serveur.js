const express = require('express');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const port = 5000;

// Middleware pour autoriser les requêtes CORS
app.use(cors());

// Middleware pour analyser les données JSON dans les requêtes
app.use(bodyParser.json());

// Définir le répertoire pour stocker les images téléchargées
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Spécifiez le chemin absolu vers le dossier "images"
    const uploadPath = path.join('C:', 'Users', 'wassi', 'Desktop', 'block-chaine - Copie', 'Sources', 'client', 'public', 'images');
    cb(null, uploadPath);  // Le dossier où les images seront stockées
  },
  filename: (req, file, cb) => {
    // Utiliser la marque comme nom d'image
    const marque = req.body.marque ? req.body.marque.trim().toLowerCase() : 'default';
    const ext = path.extname(file.originalname);
    const filename = `${marque}-${Date.now()}${ext}`;
    cb(null, filename);  // Nom du fichier modifié
  }
});

const upload = multer({ storage });

// Serveur les fichiers statiques dans le dossier public/images
app.use('/images', express.static(path.join('C:', 'Users', 'wassi', 'Desktop', 'block-chaine - Copie', 'Sources', 'client', 'public', 'images')));

// Endpoint pour télécharger l'image
app.post('/upload', upload.single('carImage'), (req, res) => {
  if (req.file && req.body.marque) {
    const marque = req.body.marque.trim().toLowerCase();
    const imagePath = `/images/${marque}-${req.file.filename}`;
    res.json({ message: 'Image téléchargée avec succès', imagePath: imagePath });
  } else {
    res.status(400).json({ error: 'Aucune image téléchargée ou marque non fournie' });
  }
});

app.listen(port, () => {
  console.log(`Serveur en cours sur http://localhost:${port}`);
});
