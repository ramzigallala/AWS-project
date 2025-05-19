# Usa l'immagine ufficiale di Node.js
FROM node:16

# Imposta la directory di lavoro per l'app server
WORKDIR /app

# Copia il file package.json e package-lock.json (se presenti) nella cartella di lavoro
COPY server/package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il codice sorgente del server nella cartella di lavoro
COPY server/ .

# Esponi la porta su cui il server ascolterà
EXPOSE 3000

# Avvia il server (assicurati che il file index.js si trovi in /app)
CMD ["node", "index.js"]

