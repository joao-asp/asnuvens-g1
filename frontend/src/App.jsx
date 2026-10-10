import React, { useState } from 'react';
import { Navbar, Container, Row, Col, Card, Button, Modal, Form, Badge } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import './index.css';

// Ícone SVG personalizado e refinado para os pins do mapa
const createCustomPin = (color) => {
  return L.divIcon({
    className: 'custom-pin',
    html: `<svg width="30" height="42" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 36 12 36C12 36 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="${color}" stroke="#ffffff" stroke-width="2"/>
            <circle cx="12" cy="12" r="4.5" fill="#ffffff"/>
           </svg>`,
    iconSize: [30, 42],
    iconAnchor: [15, 42],
    popupAnchor: [0, -42]
  });
};

function MapClickHandler({ onMapClick }) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng);
    },
  });
  return null;
}

function App() {
  const [pontos, setPontos] = useState([
    { 
      id: 1, 
      lat: -23.003, 
      lng: -47.102, 
      categoria: "Asfalto", 
      desc: "Via recém-asfaltada irradiando calor extremo e sem arborização.", 
      data: "15/08/2026", 
      status: "Pendente",
      fotos: ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=400&q=80"],
      cor: "#64748b" 
    },
    { 
      id: 2, 
      lat: -23.007, 
      lng: -47.108, 
      categoria: "Lixo", 
      desc: "Descarte irregular acumulado na esquina bloqueando a circulação.", 
      data: "14/08/2026", 
      status: "Notificado",
      fotos: ["https://images.unsplash.com/photo-1605600659873-d808a1d14b2c?auto=format&fit=crop&w=400&q=80"],
      cor: "#f59e0b" 
    },
    { 
      id: 3, 
      lat: -23.006, 
      lng: -47.100, 
      categoria: "Esgoto a céu aberto", 
      desc: "Vazamento contínuo gerando odor forte próximo às residências.", 
      data: "15/08/2026", 
      status: "Pendente",
      fotos: ["https://images.unsplash.com/photo-1590622728280-327c5b6b15fc?auto=format&fit=crop&w=400&q=80"],
      cor: "#c59dff" 
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [draftLocation, setDraftLocation] = useState(null);
  const [novaCategoria, setNovaCategoria] = useState("Lixo");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [filtroCategoria, setFiltroCategoria] = useState("Todos");
  const [mapCenter, setMapCenter] = useState([-23.005, -47.105]);

  const handleMapClick = (latlng) => {
    setDraftLocation(latlng);
    setShowModal(true);
  };

  const handleSavePoint = () => {
    if (!draftLocation || !novaDescricao.trim()) return;

    const cores = {
      "Lixo": "#f59e0b",
      "Asfalto": "#64748b",
      "Árvores": "#10b981",
      "Esgoto a céu aberto": "#c59dff",
      "Outros": "#3b82f6"
    };

    const novoPonto = {
      id: Date.now(),
      lat: draftLocation.lat,
      lng: draftLocation.lng,
      categoria: novaCategoria,
      desc: novaDescricao,
      data: new Date().toLocaleDateString('pt-BR'),
      status: "Pendente",
      fotos: ["https://images.unsplash.com/photo-1584988717804-9a1b1a7cce67?auto=format&fit=crop&w=400&q=80"],
      cor: cores[novaCategoria] || "#a2d4e2"
    };

    setPontos([...pontos, novoPonto]);
    setNovaDescricao("");
    setNovaCategoria("Lixo");
    setShowModal(false);
  };

  const pontosFiltrados = filtroCategoria === "Todos" 
    ? pontos 
    : pontos.filter(p => p.categoria === filtroCategoria);

  return (
    <div className="vh-100 d-flex flex-column bg-slate-50 overflow-hidden">
      
      {/* HEADER INSTITUCIONAL MODAL / CLEAN */}
      <Navbar className="bg-white border-bottom px-4 py-3 shadow-xs flex-shrink-0 z-3">
        <Container fluid className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-3">
            <div className="bg-dark rounded-2 p-1 d-flex align-items-center justify-content-center" style={{ width: '38px', height: '38px', background: 'linear-gradient(135deg, #c59dff 0%, #a2d4e2 100%)' }}>
              <img src="/logo.png" alt="Logo" style={{ height: '24px', objectFit: 'contain' }} onError={(e) => e.target.style.display = 'none'} />
            </div>
            <div>
              <h1 className="h6 fw-bold mb-0 text-dark tracking-tight">ASSALTAR AS NUVENS</h1>
              <small className="text-muted" style={{ fontSize: '11px' }}>Cartografia Climática // Campo Belo</small>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Button 
              variant="outline-secondary" 
              size="sm" 
              className="rounded-pill px-3 fw-medium border-0 bg-light text-dark hover-bg-slate"
              onClick={() => setMapCenter([-23.005, -47.105])}
            >
              📍 Centralizar
            </Button>
            <Button 
              size="sm" 
              className="rounded-pill px-3 fw-semibold text-white border-0 shadow-sm"
              style={{ background: 'linear-gradient(90deg, #c59dff 0%, #90e0ef 100%)', color: '#1e293b !important' }}
              onClick={() => alert("Dica: Clique em qualquer ponto do mapa para abrir o formulário de registro.")}
            >
              + Novo Registro
            </Button>
          </div>
        </Container>
      </Navbar>

      {/* CORPO PRINCIPAL RESPONSIVO */}
      <Container fluid className="flex-grow-1 p-3 p-md-4 overflow-hidden">
        <Row className="h-100 g-3">
          
          {/* MAPA PRINCIPAL */}
          <Col lg={8} className="h-100 d-flex flex-column">
            <Card className="flex-grow-1 border-0 shadow-sm rounded-4 p-1 bg-white overflow-hidden position-relative">
              <MapContainer center={mapCenter} zoom={15} zoomControl={false} style={{ cursor: 'crosshair', height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                <MapClickHandler onMapClick={handleMapClick} />

                {pontosFiltrados.map(p => (
                  <Marker key={p.id} position={[p.lat, p.lng]} icon={createCustomPin(p.cor)}>
                    <Popup className="border-0 shadow-lg rounded-3" minWidth={240}>
                      <div className="p-2">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <Badge bg="dark" className="fw-normal" style={{ backgroundColor: p.cor }}>{p.categoria}</Badge>
                          <small className="text-muted" style={{ fontSize: '10px' }}>{p.data}</small>
                        </div>
                        {p.fotos && p.fotos[0] && (
                          <div className="mb-2 rounded-2 overflow-hidden shadow-xs" style={{ height: '110px' }}>
                            <img src={p.fotos[0]} alt="Evidência" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        )}
                        <p className="mb-1 text-secondary" style={{ fontSize: '12px', lineHeight: '1.4' }}>{p.desc}</p>
                        <div className="mt-2 pt-2 border-top d-flex justify-content-between align-items-center">
                          <span className="text-xs text-muted">Status: <strong className="text-dark">{p.status}</strong></span>
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </Card>
          </Col>

          {/* PAINEL LATERAL ANALÍTICO E FEED */}
          <Col lg={4} className="h-100 d-flex flex-column overflow-auto">
            
            {/* FILTROS RÁPIDOS */}
            <div className="mb-3 d-flex gap-1 overflow-auto pb-1 flex-shrink-0">
              {['Todos', 'Lixo', 'Asfalto', 'Esgoto a céu aberto'].map(cat => (
                <Button 
                  key={cat}
                  size="sm"
                  variant={filtroCategoria === cat ? "dark" : "light"}
                  className="rounded-pill text-xs px-3 border-0 shadow-xs"
                  style={filtroCategoria === cat ? { backgroundColor: '#1e293b' } : {}}
                  onClick={() => setFiltroCategoria(cat)}
                >
                  {cat}
                </Button>
              ))}
            </div>

            {/* MÉTRICAS RÁPIDAS */}
            <Row className="g-2 mb-3 flex-shrink-0">
              <Col xs={6}>
                <Card className="border-0 shadow-xs text-center py-2 rounded-3 bg-white">
                  <Card.Body className="p-2">
                    <h3 className="fw-bold mb-0 text-dark">{pontos.length}</h3>
                    <small className="text-muted" style={{ fontSize: '11px' }}>Total Mapeado</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6}>
                <Card className="border-0 shadow-xs text-center py-2 rounded-3 bg-white">
                  <Card.Body className="p-2">
                    <h3 className="fw-bold mb-0 text-warning">{pontos.filter(p => p.status === 'Pendente').length}</h3>
                    <small className="text-muted" style={{ fontSize: '11px' }}>Pendentes</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            {/* LISTA DE REGISTROS (FEED) */}
            <div className="flex-grow-1 overflow-auto pe-1 space-y-2">
              <div className="text-xs text-uppercase fw-bold text-muted mb-2 px-1">Ocorrências Recentes no Território</div>
              
              {[...pontosFiltrados].reverse().map(p => (
                <Card key={p.id} className="border-0 shadow-xs mb-2 rounded-3 bg-white hover-shadow transition-all cursor-pointer">
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <div className="d-flex align-items-center gap-2">
                        <span style={{ width: '10px', height: '10px', backgroundColor: p.cor, borderRadius: '50%' }}></span>
                        <strong className="text-dark fs-6">{p.categoria}</strong>
                      </div>
                      <Badge bg="light" text="dark" className="border text-xs fw-normal">{p.status}</Badge>
                    </div>
                    <p className="text-muted mb-0 mt-1" style={{ fontSize: '12px', lineHeight: '1.4' }}>{p.desc}</p>
                  </Card.Body>
                </Card>
              ))}
            </div>

            {/* RODAPÉ DO PAINEL */}
            <div className="mt-3 pt-3 border-top text-muted flex-shrink-0" style={{ fontSize: '11px' }}>
              <p className="mb-0"><strong>Kit de Soberania Local</strong> • Campo Belo, Campinas</p>
            </div>

          </Col>
        </Row>
      </Container>

      {/* MODAL DE REGISTRO ELEGANTE */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5 text-dark">Novo Registro Cidadão</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-2">
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary small">Categoria da Ocorrência</Form.Label>
              <Form.Select 
                value={novaCategoria} 
                onChange={(e) => setNovaCategoria(e.target.value)} 
                className="shadow-none border bg-light rounded-3 py-2"
              >
                <option value="Lixo">Acúmulo de Lixo</option>
                <option value="Asfalto">Ilha de Calor (Asfalto)</option>
                <option value="Esgoto a céu aberto">Esgoto a céu aberto</option>
                <option value="Árvores">Refúgio Verde (Árvores)</option>
                <option value="Outros">Outros</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-secondary small">Descrição do Problema</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                placeholder="Descreva o que foi observado no local..."
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                className="shadow-none border bg-light rounded-3"
              />
            </Form.Group>

            <Form.Group className="mb-2">
              <Form.Label className="fw-semibold text-secondary small">Adicionar Evidência Fotográfica</Form.Label>
              <Form.Control 
                type="file" 
                accept="image/*" 
                capture="environment"
                className="shadow-none border bg-light rounded-3 text-muted small"
              />
              <Form.Text className="text-muted" style={{ fontSize: '10px' }}>
                Você pode tirar uma foto na hora com o celular ou carregar da galeria.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 pb-3">
          <Button variant="light" onClick={() => setShowModal(false)} className="rounded-pill px-4 fw-semibold text-muted">
            Cancelar
          </Button>
          <Button 
            onClick={handleSavePoint} 
            disabled={!novaDescricao.trim()} 
            className="rounded-pill px-4 fw-semibold text-white border-0 shadow-sm"
            style={{ backgroundColor: '#1e293b' }}
          >
            Enviar Registro
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

export default App;