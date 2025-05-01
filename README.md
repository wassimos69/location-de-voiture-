<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>

</head>
<body>

  <h1>🚗 One-Rente — Application Web3 de Location de Voitures Décentralisée</h1>

  <p><strong>One-Rente</strong> est une application Web décentralisée (DApp) de location de voitures, développée avec <strong>React</strong> et <strong>Truffle</strong>. Elle permet d'interagir avec des contrats intelligents sur la blockchain via une interface intuitive.</p>

  <h2>⚙️ Prérequis</h2>
  <p>Avant de commencer, assure-toi d’avoir installé :</p>
  <ul>
    <li>Node.js</li>
    <li>Truffle</li>
    <li>Ganache</li>
    <li>npm</li>
  </ul>

  <h2>🚀 Installation</h2>
  <p><strong>1. Cloner le dépôt :</strong></p>
  <pre><code>git clone https://github.com/wassimos69/location-de-voiture-.git
  </code></pre>

  <p><strong>2. Installer les dépendances :</strong></p>
  <pre><code>npm install</code></pre>

  <h2>🧪 Lancer un réseau local Ganache</h2>
  <p>Démarre Ganache avec 10 comptes ayant chacun 100 ETH :</p>
  <pre><code>ganache --port 8545 --chain.chainId 1337 --wallet.totalAccounts 10 --wallet.defaultBalance 100</code></pre>

  <h2>📦 Déployer les contrats intelligents</h2>
  <pre><code>truffle migrate --network ganache</code></pre>

  <h2>☁️ Lancer le serveur d’upload (Node.js)</h2>
  <pre><code>node serveur.js</code></pre>

  <h2>🌐 Lancer l'application React</h2>
  <pre><code>npm start</code></pre>

  <h2>🎉 Profite de l'application !</h2>
   <p align="center">
  <img src="./image_2025-05-01_213636544.png" alt="Aperçu de l’interface" width="600"/>
</p>
</body>
</html>


