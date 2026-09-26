#!/usr/bin/env bash

echo ">> Configurando a interface React + Bootstrap + Leaflet..."

# Limpa o CSS padrão do Vite que conflita com o Bootstrap
rm -f src/App.css

# Cria o CSS global para garantir o fundo escuro e o mapa 100%
cat << 'EOF' > src/index.css
body, html {
  margin: 0;
  padding: 0;
  background-color: #09090b; /* Fundo escuro profundo */
}
.leaflet-container {
  width: 100%;
  height: 100%;
  background: #09090b;
}
EOF

# Reescreve o App.jsx com a paleta roxo claro e azul claro e espaço da logo
cat << 'EOF' > src/App.jsx
import React from 'react';
import { Navbar, Container, Row, Col, Card, Badge } from 'react-bootstrap';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import './index.css';

function App() {
  // Dados simulados do Campo Belo
  const pontos = [
    { id: 1, lat: -22.962, lng: -47.132, tipo: "Ilha de Calor (Asfalto)", desc: "Pavimentação recente sem cobertura vegetal.", cor: "#ef4444" },
    { id: 2, lat: -22.967, lng: -47.138, tipo: "Ponto Crítico de Resíduos", desc: "Descarte irregular de entulho em via pública.", cor: "#eab308" },
    { id: 3, lat: -22.964, lng: -47.134, tipo: "Rua de Terra / Poeira", desc: "Trecho sem pavimentação gerando poeira crônica.", cor: "#38bdf8" } // Destaque em azul claro
  ];

  return (
    <div className="vh-100 d-flex flex-column" style={{ backgroundColor: '#09090b', color: '#f4f4f5', fontFamily: 'monospace' }}>
      
      {/* HEADER INSTITUCIONAL COM LINHA ROXO CLARO */}
      <Navbar style={{ backgroundColor: '#18181b', borderBottom: '1px solid #c084fc' }} variant="dark" className="px-4 py-3">
        <Container fluid className="d-flex align-items-center">
          <Navbar.Brand className="fw-bold d-flex align-items-center m-0" style={{ color: '#e9d5ff', letterSpacing: '1px' }}>
            
            {/* ESPAÇO RESERVADO PARA A LOGO */}
            <div style={{ 
              width: '50px', height: '50px', 
              backgroundColor: '#27272a', border: '1px dashed #c084fc', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              marginRight: '15px', borderRadius: '6px', fontSize: '10px', color: '#c084fc' 
            }}>
              [LOGO]
            </div>
            
            ASSALTAR AS NUVENS <span className="mx-3" style={{ color: '#27272a' }}>|</span> NODO CAMPO BELO
          </Navbar.Brand>
          
          {/* BADGE AZUL CLARO */}
          <Badge style={{ backgroundColor: '#38bdf8', color: '#09090b', fontSize: '13px', padding: '8px 12px' }}>
            GCD - ONLINE
          </Badge>
        </Container>
      </Navbar>

      {/* GRID PRINCIPAL */}
      <Container fluid className="flex-grow-1 p-0">
        <Row className="h-100 g-0">
          
          {/* MAPA LEAFLET */}
          <Col md={8} className="h-100 position-relative">
            <MapContainer center={[-22.965, -47.135]} zoom={15} zoomControl={false}>
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap'
              />
              {pontos.map(p => (
                <CircleMarker key={p.id} center={[p.lat, p.lng]} pathOptions={{ color: p.cor, fillColor: p.cor, fillOpacity: 0.8 }} radius={8}>
                  <Popup className="text-dark"><strong>{p.tipo}</strong><br/>{p.desc}</Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </Col>

          {/* SIDEBAR DE DADOS CIDADÃOS */}
          <Col md={4} className="h-100 overflow-auto p-4" style={{ backgroundColor: '#09090b', borderLeft: '1px solid #27272a' }}>
            <h6 className="text-uppercase mb-4 fw-bold" style={{ color: '#c084fc', letterSpacing: '2px' }}>Monitoramento de Campo</h6>
            
            <Row className="mb-5 g-3">
              <Col xs={6}>
                <Card style={{ backgroundColor: '#18181b', borderColor: '#27272a' }} className="h-100 text-center py-3">
                  <Card.Body>
                    <h2 style={{ color: '#38bdf8', fontSize: '3rem' }} className="mb-0 fw-bold">14</h2>
                    <small style={{ color: '#a1a1aa' }}>Pontos Coletados</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6}>
                <Card style={{ backgroundColor: '#18181b', borderColor: '#27272a' }} className="h-100 text-center py-3">
                  <Card.Body>
                    <h2 className="text-danger mb-0 fw-bold" style={{ fontSize: '3rem' }}>3</h2>
                    <small style={{ color: '#a1a1aa' }}>Ilhas de Calor</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <h6 className="text-uppercase mb-4 fw-bold" style={{ color: '#c084fc', letterSpacing: '2px' }}>Últimos Registros</h6>
            {pontos.map(p => (
              <Card key={p.id} style={{ backgroundColor: '#18181b', borderColor: '#27272a' }} className="mb-3">
                <Card.Body className="py-3">
                  <div className="d-flex align-items-center mb-1">
                    <span style={{ width: '12px', height: '12px', backgroundColor: p.cor, borderRadius: '50%', marginRight: '10px' }}></span>
                    <strong style={{ color: '#e9d5ff' }} className="m-0">{p.tipo}</strong>
                  </div>
                  <small style={{ color: '#a1a1aa' }} className="d-block ms-4">{p.desc}</small>
                </Card.Body>
              </Card>
            ))}

            <div className="mt-5 pt-4 small" style={{ borderTop: '1px solid #27272a', color: '#71717a' }}>
              <p className="mb-2"><strong style={{ color: '#38bdf8' }}>Projeto:</strong> Cartografia Climática Periférica</p>
              <p className="mb-0"><strong style={{ color: '#38bdf8' }}>Infraestrutura:</strong> Kit de Soberania (Local)</p>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default App;
EOF

# Reescreve o main.jsx limpo
cat << 'EOF' > src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

echo ">> Prototipo corporativo e soberano montado com sucesso!"
