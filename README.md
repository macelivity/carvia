# carvia
HSB SWSYSPRO Labor-Projekt im Sommersemester 2025

## Projektstart mit Docker

### Voraussetzungen
- Docker und Docker Compose müssen installiert sein.

### Starten des Projekts
1. Im Projektverzeichnis das folgende Kommando ausführen:
   
   ```
   docker-compose up --build
   ```

2. Das Backend ist danach unter [http://localhost:5000/api](http://localhost:5000/api) erreichbar.

3. Das Frontend ist unter [http://localhost:5000/](http://localhost:5000/) erreichbar.
   
4. Das Frontend wird zudem separat auf Port 3000 [http://localhost:3000/](http://localhost:3000) deployed.

- Die Datenbankdaten werden im Ordner `data/` persistiert und bleiben auch nach einem Neustart der Container erhalten.
- Änderungen am Code werden automatisch übernommen (Hot-Reload für Frontend und Backend).


### Container stoppen:
  ```
  docker-compose down
  ```

### Hinweise
- Standard-Testnutzer werden beim ersten Start automatisch angelegt.
 >  Username    | Password     | Rolle
 > ------------------------------------------
 >  mitglied    | mitglied     | Mitglied
 >  mitarbeiter | mitarbeiter  | Mitarbeiter
 >  admin       | admin        | Admin
- Für die Entwicklung kann das Backend auch ohne Docker direkt mit Python gestartet werden.
 - Dazu in das Backend-Verzeichnis gehen
 - Ein python venv erstellen und aktivieren
 - "pip install --no-cache-dir -r requirements.txt" ausführen
 - "python run.py" ausführen
