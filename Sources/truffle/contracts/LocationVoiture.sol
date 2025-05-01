// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract LocationVoiture {
    struct Voiture {
        uint id;
        string marque;
        uint prixParJour;
        bool disponible;
        string imageNom;
    }

    struct Reservation {
        address locataire;
        uint dateDebut;
        uint dateFin;
    }

    struct Locataire {
        string nom;
        string prenom;
        string adresse;
        uint voitureId;
        uint nombreDeJours;
        uint dateDebut;
    }

    address public proprietaire;
    uint public compteurVoitures;

    mapping(uint => Voiture) public voitures;
    mapping(address => Locataire) public reservations;
    mapping(uint => Reservation[]) public historiqueReservations;

    constructor() {
        proprietaire = msg.sender;

        voitures[0] = Voiture(0, "Toyota Supra", 1 ether, true, "toyota-supra.jpg");
        voitures[1] = Voiture(1, "Renault Clio", 1 ether, true, "renault-clio.jpg");
        voitures[2] = Voiture(2, "Volkswagen Golf", 6 ether, true, "volkswagen-golf.jpg");
        voitures[3] = Voiture(3, "audi RS7", 4 ether, true, "audi-RS7.jpg");
        voitures[4] = Voiture(4, "BMW Serie 3", 9 ether, true, "bmw-serie3.jpg");
        voitures[5] = Voiture(5, " Dodge Challenger", 4.5 ether, true, "Dodge-Challenger.jpg");

        compteurVoitures = 6;
    }

    modifier uniquementProprietaire() {
        require(msg.sender == proprietaire, "Action reservee au proprietaire.");
        _;
    }

    function ajouterVoiture(string memory _marque, uint _prixParJour, string memory _imageNom) public uniquementProprietaire {
        voitures[compteurVoitures] = Voiture(compteurVoitures, _marque, _prixParJour, true, _imageNom);
        compteurVoitures++;
    }

    function supprimerVoiture(uint _voitureId) public uniquementProprietaire {
        require(_voitureId < compteurVoitures, "Voiture inexistante.");
        delete voitures[_voitureId];
    }

    function modifierVoiture(uint _voitureId, string memory _marque, uint _prixParJour, bool _disponible, string memory _imageNom) public uniquementProprietaire {
        require(voitures[_voitureId].id == _voitureId, "Voiture inexistante.");
        voitures[_voitureId] = Voiture(_voitureId, _marque, _prixParJour, _disponible, _imageNom);
    }

    function voituresDisponibles(uint dateDebut, uint dateFin) public view returns (Voiture[] memory) {
        uint count = 0;
        for (uint i = 0; i < compteurVoitures; i++) {
            if (voitures[i].disponible && estDisponible(i, dateDebut, dateFin)) {
                count++;
            }
        }

        Voiture[] memory disponibles = new Voiture[](count);
        uint index = 0;

        for (uint i = 0; i < compteurVoitures; i++) {
            if (voitures[i].disponible && estDisponible(i, dateDebut, dateFin)) {
                disponibles[index] = voitures[i];
                index++;
            }
        }

        return disponibles;
    }

    function estDisponible(uint voitureId, uint dateDebut, uint dateFin) public view returns (bool) {
        Reservation[] memory reservationsVoiture = historiqueReservations[voitureId];

        for (uint i = 0; i < reservationsVoiture.length; i++) {
            if (
                (dateDebut >= reservationsVoiture[i].dateDebut && dateDebut < reservationsVoiture[i].dateFin) ||
                (dateFin > reservationsVoiture[i].dateDebut && dateFin <= reservationsVoiture[i].dateFin) ||
                (dateDebut <= reservationsVoiture[i].dateDebut && dateFin >= reservationsVoiture[i].dateFin)
            ) {
                return false;
            }
        }

        return true;
    }

    function louerVoiture(
        uint _voitureId,
        string memory _nom,
        string memory _prenom,
        string memory _adresse,
        uint _jours,
        uint _dateDebut
    ) public payable {
        require(_voitureId < compteurVoitures, "Voiture inexistante.");
        Voiture storage voiture = voitures[_voitureId];
        require(voiture.disponible, "Voiture non disponible.");
        require(_jours > 0, "Nombre de jours invalide.");

        uint dateFin = _dateDebut + (_jours * 1 days);
        require(estDisponible(_voitureId, _dateDebut, dateFin), "Voiture non disponible pour cette periode.");

        uint coutTotal = voiture.prixParJour * _jours;
        require(msg.value >= coutTotal, "Montant insuffisant pour la location.");

        reservations[msg.sender] = Locataire(_nom, _prenom, _adresse, _voitureId, _jours, _dateDebut);
        historiqueReservations[_voitureId].push(Reservation(msg.sender, _dateDebut, dateFin));
    }

    function retirer() public uniquementProprietaire {
        payable(proprietaire).transfer(address(this).balance);
    }

    function retirerVers(address payable destinataire) public uniquementProprietaire {
        require(destinataire != address(0), "Adresse invalide.");
        destinataire.transfer(address(this).balance);
    }

    function rendreVoitureDisponible(uint _voitureId) public uniquementProprietaire {
        require(_voitureId < compteurVoitures, "Voiture inexistante.");
        voitures[_voitureId].disponible = true;
    }

    function getReservations(uint voitureId) public view returns (Reservation[] memory) {
        return historiqueReservations[voitureId];
    }
}
