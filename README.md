# Projet AWS Multi-Player Tetris

Tetris Multi-joueur réalisé par les éleves Antoine Fernandez et Ronan d'Amonville.

Comment jouer : 
----------------

Créer vous un compte ou alors connectez vous sur le votre.

Vous pouvez créer un lobby où d'autres joueurs pourront vous rejoindre ou bien en créer et jouer en attendant qu'un joueur vous rejoigne et joue avec vous. 

Lorsque votre grille se remplit en entier, vous avez perdu, votre compteur de mort s'augmente de 1 et vous retournés sur la page des joueurs connectés.

Pour jouer au tétris:
---------------------

Des pièces apparaissent au niveau de votre écran sur la partie haute de votre écran, vous pouvez la déplacée avec les flèches directionnels _GAUCHE_ et _DROITE_ et la faire pivoter en utilisant les flèches _HAUT_ et _BAS_. En appuyant sur _ESPACE_, la pièce descendre plus vite.

Lorsque une ligne est rempli, cette ligne disparait et votre score augmente. 

En haut à gauche se trouve la prévisalisation de la prochaine pièce.

# Structuration du code :

Coté client:
------------

Un tétris en javascript avec la gestion coté client des mouvements, des rotations ... 
Une page de connexion lié a un tableau coté serveur et un affichage en fonctions des joueurs présents sur le serveurs/lobbies existants.

Une classe connection manager permet d'envoyer des données grâce a un websocket comme l'état du jeu (grille, position des pièces, action de l'utilisateur), ou bien le score.

Coté serveur:
-------------

Des tableaux permettants de stockers les inscriptions de joueurs, de lobbys et un tableau permetttant de stocker les utilisateurs en ligne. 

Lors d'un lancement d'une partie, le websocket serveur génère des clients liés aux utilisateurs et les insère dans une session, représenté par un lobby. Lors d'une modification d'un état d'un des joueur présent dans le lobby, ces données sont envoyés au serveur grâce au websocket client et le serveur envoie a tous les autres clients la modification de l'état de jeu du joueur. Cela permet une synchronisation entre tous les joueurs présents dans le lobby.

Lorsque tous les joueurs ont quittés le lobby, par choix ou après avoir perdu la partie, le lobby est créer si et seulement si il n'y as plus de joueur présent dans le lobby.


Ce qu'il manque au projet :
---------------------------

* Il manque l'implémentation du bouton _CHALLENGE_ pour défier un utilisateur en ligne.

* Lorsqu'une ligne disparait chez un utilisateur, elle n'est pas rajouté en plus chez les adversaires.


Ce qu'il y a en plus par rapport au sujet :
----------------------------------------------

* La possibilité de jouer de 1 joueur à une infinité de joueur aux systèmes du lobby.


Problème rencontrés : 
----------------------

* Une impossibilité de lié une base de donnée avec ce projet car nous n'arrivons pas a lancer des websockets. Nous pensons qu'il y a un problème de conflit de port.

* Nous n'avons pas reussi a implémenter le bouton _CHALLENGE_ car nous n'avons pas reussi a récupérer le websocket de l'utilisateur défié, ce qui nous empêche de rediriger l'utilisateur défié.
