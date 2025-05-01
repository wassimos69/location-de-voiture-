import React, { useContext, useEffect, useState, useCallback, useRef } from "react";
import { EthContext } from "../contexts/EthContext";
import "./VoitureLocation.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";


/* global BigInt */

export default function VoitureLocation() {
  const { state } = useContext(EthContext);
  const { contract, accounts } = state;
  const [adminDateDebut, setAdminDateDebut] = useState("");
const [adminDateFin, setAdminDateFin] = useState("");
const voituresSectionRef = useRef(null);
const locationFormRef = useRef(null);
const footerRef = useRef(null);


  const [voitures, setVoitures] = useState([]);
  const [voituresDisponibles, setVoituresDisponibles] = useState([]);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    adresse: "",
    voitureId: "",
    dateDebut: "",
    dateFin: ""
  });
  const [message, setMessage] = useState("");
  const [proprietaire, setProprietaire] = useState("");
  const [reservationsParVoiture, setReservationsParVoiture] = useState({});
  const [newCar, setNewCar] = useState({ marque: "", prixParJour: "" });
  const [newCarImage, setNewCarImage] = useState(null);
  const [dateError, setDateError] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false); // Nouvelle gestion de l'état pour l'upload de l'image

  const fetchVoitures = useCallback(async () => {
    if (contract && accounts && accounts.length > 0) {
      try {
        const prop = await contract.methods.proprietaire().call();
        setProprietaire(prop);
  
        const total = await contract.methods.compteurVoitures().call();
        const allVoitures = [];
        const allReservations = {};
  
        for (let i = 0; i < total; i++) {
          const v = await contract.methods.voitures(i).call();
          const prix = BigInt(v.prixParJour);
  
          if (prix > 0n) { // filtre les voitures avec prix > 0
            allVoitures.push(v);
            const res = await contract.methods.getReservations(i).call();
            allReservations[i] = res;
          }
        }
  
        setVoitures(allVoitures);
        setReservationsParVoiture(allReservations);
      } catch (err) {
        console.error("Erreur de fetchVoitures:", err);
      }
    }
  }, [contract, accounts]);
  

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      fetchVoitures();
    }
  }, [contract, accounts, fetchVoitures]);

  const calculerJours = (start, end) => {
    const d1 = new Date(start);
    const d2 = new Date(end);
    const diff = Math.floor((d2 - d1) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const verifierDisponibilite = (voitureId, dateDebut, dateFin) => {
    const reservations = reservationsParVoiture[voitureId] || [];
    const debutTimestamp = new Date(dateDebut).getTime() / 1000;
    const finTimestamp = new Date(dateFin).getTime() / 1000;

    for (const r of reservations) {
      if (
        (debutTimestamp >= r.dateDebut && debutTimestamp < r.dateFin) ||
        (finTimestamp > r.dateDebut && finTimestamp <= r.dateFin) ||
        (debutTimestamp <= r.dateDebut && finTimestamp >= r.dateFin)
      ) {
        return false;
      }
    }
    return true;
  };
  const retirerFonds = async () => {
    if (!window.confirm("Voulez-vous vraiment retirer tout le solde vers votre adresse ?")) {
      return;
    }
  
    try {
      await contract.methods.retirerVers(accounts[0]).send({ from: accounts[0] });
      setMessage("Tous les fonds ont été transférés avec succès !");
    } catch (err) {
      setMessage("Erreur lors du retrait : " + err.message);
    }
  };
  const filtrerVoituresDisponibles = () => {
    const { dateDebut, dateFin } = form;
    if (!dateDebut || !dateFin || new Date(dateDebut) >= new Date(dateFin)) {
      setVoituresDisponibles([]);
      setDateError(true);
      return;
    }

    setDateError(false);
    const disponibles = voitures.filter(v =>
      verifierDisponibilite(v.id, dateDebut, dateFin)
    );
    setVoituresDisponibles(disponibles);
  };

  useEffect(() => {
    filtrerVoituresDisponibles();
  }, [form.dateDebut, form.dateFin, reservationsParVoiture]);

  const louer = async () => {
    const { nom, prenom, adresse, voitureId, dateDebut, dateFin } = form;

    if (!nom || !prenom || !adresse || !voitureId || !dateDebut || !dateFin) {
      setMessage("Tous les champs sont requis.");
      return;
    }

    const jours = calculerJours(dateDebut, dateFin);
    if (jours <= 0) {
      setMessage("La date de fin doit être postérieure à la date de début.");
      return;
    }

    const voiture = voitures.find(v => v.id === voitureId);
    if (!voiture) {
      setMessage("Voiture non trouvée.");
      return;
    }

    if (!verifierDisponibilite(voitureId, dateDebut, dateFin)) {
      setMessage("Cette voiture est déjà louée pour les dates sélectionnées.");
      return;
    }

    const timestampDebut = new Date(dateDebut).getTime() / 1000;

    try {
      const prixTotal = BigInt(voiture.prixParJour) * BigInt(jours);
      await contract.methods
        .louerVoiture(voitureId, nom, prenom, adresse, jours, Math.floor(timestampDebut))
        .send({ from: accounts[0], value: prixTotal.toString() });

      setMessage("Voiture louée avec succès !");
      fetchVoitures();
    } catch (err) {
      setMessage("Erreur pendant la location : " + err.message);
    }
  };

  const handleImageUpload = async () => {
    if (!newCarImage || !newCar.marque) {
      setMessage("Image et marque requises pour l'envoi.");
      return null;
    }
  
    setUploadingImage(true);
  
    const formData = new FormData();
    formData.append("carImage", newCarImage);
    formData.append("marque", newCar.marque.trim());
  
    try {
      const res = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData,
      });
  
      const data = await res.json();
      if (res.ok) {
        setMessage(`Image enregistrée : ${data.imagePath}`);
        return data.imagePath; // <- retourne le nom du fichier
      } else {
        setMessage(`Erreur de l’envoi de l’image : ${data.error}`);
        return null;
      }
    } catch (err) {
      setMessage("Erreur de connexion au serveur d’image.");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };
  const [isDeleting, setIsDeleting] = useState(false);
  const supprimerVoiture = async (voitureId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette voiture ?")) {
      return;
    }
  
    try {
      await contract.methods
        .supprimerVoiture(voitureId)
        .send({ from: accounts[0] });
  
      // Mettre à jour tous les états
      setVoitures(prev => prev.filter(v => v.id !== voitureId.toString()));
      setVoituresDisponibles(prev => prev.filter(v => v.id !== voitureId.toString()));
      
      // Rafraîchir les données depuis la blockchain
      await fetchVoitures();
      
      setMessage("Voiture supprimée avec succès !");
    } catch (err) {
      setMessage("Erreur lors de la suppression : " + err.message);
    }
  };

  const ajouterVoiture = async () => {
    const { marque, prixParJour } = newCar;
    if (!marque || !prixParJour) {
      setMessage("Tous les champs sont requis pour ajouter une voiture.");
      return;
    }
  
    if (uploadingImage) {
      setMessage("L'image est toujours en cours d'upload.");
      return;
    }
  
    try {
      const imageNom = await handleImageUpload(); // <- on récupère le nom
      if (!imageNom) return;
  
      const prixWei = BigInt(Math.floor(parseFloat(prixParJour) * 1e18));
      await contract.methods
        .ajouterVoiture(marque, prixWei.toString(), imageNom)
        .send({ from: accounts[0] });
  
      setMessage("Voiture ajoutée avec succès !");
      setNewCar({ marque: "", prixParJour: "" });
      setNewCarImage(null);
      fetchVoitures();
    } catch (err) {
      setMessage("Erreur lors de l'ajout de la voiture : " + err.message);
    }
  };
  
  const scrollToSection = (section) => {
    if (section === "accueil" && voituresSectionRef.current) {
      voituresSectionRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (section === "location" && locationFormRef.current) {
      locationFormRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (section === "contact" && footerRef.current) {
      footerRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  
  const estProprietaire = accounts && accounts[0] === proprietaire;
  const minDate = new Date().toISOString().split("T")[0];

  return (
    <>
    <Navbar scrollToSection={scrollToSection}/>
      
    <div className="container">
      

      <div  ref={locationFormRef} className="form-section">
        <h2 className="subtitle">Formulaire de location</h2>
        <div className="form-grid">
          <input placeholder="Nom" value={form.nom} onChange={e => setForm({ ...form, nom: e.target.value })} />
          <input placeholder="Prénom" value={form.prenom} onChange={e => setForm({ ...form, prenom: e.target.value })} />
          <input placeholder="Adresse" value={form.adresse} onChange={e => setForm({ ...form, adresse: e.target.value })} />
          <input
            type="date"
            min={minDate}
            className={dateError ? "input-error" : ""}
            value={form.dateDebut}
            onChange={e => setForm({ ...form, dateDebut: e.target.value })}
          />
          <input
            type="date"
            min={form.dateDebut || minDate}
            className={dateError ? "input-error" : ""}
            value={form.dateFin}
            onChange={e => setForm({ ...form, dateFin: e.target.value })}
          />
          <select value={form.voitureId} onChange={e => setForm({ ...form, voitureId: e.target.value })}>
            <option value="">Voitures disponibles</option>
            {voituresDisponibles.map(v => (
              <option key={v.id} value={v.id}>{v.marque} - {parseInt(v.prixParJour) / 1e18} ETH/jour</option>
            ))}
          </select>
        </div>
        <button className="primary" onClick={louer}>Louer</button>
        {message && <p className="message">{message}</p>}
      </div>

      <div  ref={voituresSectionRef} className="voiture-list">
        {voitures.map(v => (
        <div key={v.id} className="car-card">
        <img
        src={`/images/${v.imageNom.replace(/^.*(?=default-\d+)/, '')}`}
        alt={v.marque}
        onError={(e) => e.target.style.display = 'none'} 
        />
        <h3>{v.marque}</h3>
        <p>Prix par jour: {parseInt(v.prixParJour) / 1e18} ETH</p>
    </div>
  ))}
</div>

      
{estProprietaire && (
  <div className="form-section">
    
    <h2 >      Gestion des voitures</h2>
          <input
            placeholder="Marque"
            value={newCar.marque}
            onChange={e => setNewCar({ ...newCar, marque: e.target.value })}
          />
          <input
            placeholder="Prix par jour (ETH)"
            type="number"
            value={newCar.prixParJour}
            onChange={e => setNewCar({ ...newCar, prixParJour: e.target.value })}
          />
          <input type="file" onChange={e => setNewCarImage(e.target.files[0])} />
          <button onClick={ajouterVoiture} className="retrait-button" >Ajouter voiture</button>
          {message && <p>{message}</p>}
          <h2>    disponibilité     </h2>
          
          
    <div style={{ marginBottom: "1em" }}>
      <label>Date début : </label>
      <input
        type="date"
        min={minDate}
        value={adminDateDebut}
        onChange={(e) => setAdminDateDebut(e.target.value)}
      />
      <label style={{ marginLeft: "1em" }}>Date fin : </label>
      <input
        type="date"
        min={adminDateDebut || minDate}
        value={adminDateFin}
        onChange={(e) => setAdminDateFin(e.target.value)}
      />
     
    </div>

    {voitures
      .filter((v) => {
        if (!adminDateDebut || !adminDateFin) return true;
        return verifierDisponibilite(v.id, adminDateDebut, adminDateFin);
      })
      .map((v) => {
        const reservations = reservationsParVoiture[v.id] || [];
        const estDisponible = adminDateDebut && adminDateFin
          ? verifierDisponibilite(v.id, adminDateDebut, adminDateFin)
          : null;

        return (
          
          <div key={v.id} className="admin-car-card">
            <h3>{v.marque}</h3>
            <p>Prix : {parseInt(v.prixParJour) / 1e18} ETH/jour</p>
            <button 
              className="delete-button" 
              onClick={() => supprimerVoiture(v.id)}
              disabled={reservations.length > 0 || isDeleting}
            >
                 {isDeleting ? "Suppression en cours..." : "Supprimer cette voiture"}
            </button>
            <p>Statut : {reservations.length > 0 ? "Louée" : "Disponible"}</p>
            <p>
              Disponibilité sur cette période :
              {estDisponible === null
                ? " Sélectionnez une période"
                : estDisponible
                ? " ✅ Disponible"
                : " ❌ Indisponible"}
            </p>
            

            {reservations.length > 0 ? (
              <details>
                <summary>Réservations ({reservations.length})</summary>
                <ul>
                  {reservations.map((r, idx) => (
                    <li key={idx}>
                      Du <strong>{new Date(r.dateDebut * 1000).toLocaleDateString()}</strong>
                      au <strong>{new Date(r.dateFin * 1000).toLocaleDateString()}</strong>
                    </li>
                  ))}
                </ul>
              </details>
            ) : (
              <p>Aucune réservation</p>
            )}
          </div>
        );
      })}
       <button 
      className="retrait-button" 
      onClick={retirerFonds}
    >
      Retirer tout le solde
    </button>
  </div>
  
)}


    </div >
      <Footer ref={footerRef}/>
      </>
  );

}
