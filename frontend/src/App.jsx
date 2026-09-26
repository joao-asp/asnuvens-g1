import React, { useState } from 'react';
import { Navbar, Container, Row, Col, Card, Button, Modal, Form } from 'react-bootstrap';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'leaflet/dist/leaflet.css';
import './index.css';

const API_URL = 'http://localhost:8000';

// Função para gerar um Pino de Mapa real (SVG) usando as cores do projeto
const createCustomPin = (color) => {
  return L.divIcon({
    className: 'custom-pin',
    html: `<svg width="28" height="42" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.37 0 0 5.37 0 12C0 21 12 36 12 36C12 36 24 21 24 12C24 5.37 18.63 0 12 0Z" fill="${color}" stroke="#09090b" stroke-width="1.5"/>
            <circle cx="12" cy="12" r="5" fill="#ffffff"/>
           </svg>`,
    iconSize: [28, 42],
    iconAnchor: [14, 42],
    popupAnchor: [0, -42]
  });
};

// Captura o clique no mapa
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
    { id: 1, lat: -23.003, lng: -47.102, categoria: "Asfalto", desc: "Via recém-asfaltada irradiando calor extremo.", data: "15/08/2026", cor: "#495057" },
    { id: 2, lat: -23.007, lng: -47.108, categoria: "Lixo", desc: "Descarte irregular bloqueando a calçada.", data: "14/08/2026", cor: "#ffc107" },
    { id: 3, lat: -23.006, lng: -47.100, categoria: "Esgoto a céu aberto", desc: "Vazamento contínuo próximo à área residencial.", data: "15/08/2026", cor: "#c59dff" }
  ]);

  // Estados do Formulário de GCD
  const [showModal, setShowModal] = useState(false);
  const [draftLocation, setDraftLocation] = useState(null);
  const [novaCategoria, setNovaCategoria] = useState("Lixo");
  const [novaDescricao, setNovaDescricao] = useState("");
  const [novaImagem, setNovaImagem] = useState(null);
  const [imagemPreview, setImagemPreview] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erroSalvamento, setErroSalvamento] = useState("");

  const countLixo = pontos.filter(p => p.categoria === "Lixo").length;
  const countAsfalto = pontos.filter(p => p.categoria === "Asfalto").length;

  // Ao clicar no mapa, salva a coordenada provisória e abre o formulário
  const handleMapClick = (latlng) => {
    setDraftLocation(latlng);
    setShowModal(true);
  };

  // Salva o ponto definitivamente no mapa
  const handleImageChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setNovaImagem(file);
    setImagemPreview(URL.createObjectURL(file));
  };

  const handleCloseModal = () => {
    setNovaDescricao("");
    setNovaCategoria("Lixo");
    setNovaImagem(null);
    setImagemPreview("");
    setErroSalvamento("");
    setShowModal(false);
  };

  const handleSavePoint = async () => {
    if (!draftLocation || !novaDescricao.trim()) return;

    setSalvando(true);
    setErroSalvamento("");

    // Define a cor baseada na categoria
    const cores = {
      "Lixo": "#ffc107",
      "Asfalto": "#495057",
      "Árvores": "#10b981",
      "Esgoto a céu aberto": "#c59dff",
      "Outros": "#a2d4e2"
    };

    try {
      const formData = new FormData();
      formData.append('lat', draftLocation.lat);
      formData.append('lng', draftLocation.lng);
      formData.append('categoria', novaCategoria);
      formData.append('descricao', novaDescricao.trim());
      if (novaImagem) formData.append('imagem', novaImagem);

      const response = await fetch(`${API_URL}/evidencias`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || 'Não foi possível salvar o registro.');

      setPontos([...pontos, {
        ...data,
        data: new Date().toLocaleDateString('pt-BR'),
        cor: cores[novaCategoria] || "#a2d4e2",
        imagemUrl: data.imagem_url ? `${API_URL}${data.imagem_url}` : null,
      }]);
      handleCloseModal();
    } catch (error) {
      setErroSalvamento(error.message);
    } finally {
      setSalvando(false);
    }
  };

  return (
    <div className="vh-100 d-flex flex-column bg-light">
      
      {/* HEADER */}
      <Navbar className="shadow-sm px-4 py-3 z-3" style={{ background: 'linear-gradient(90deg, #c59dff 0%, #a2d4e2 100%)' }}>
        <Container fluid className="d-flex align-items-center justify-content-between">
          <Navbar.Brand className="d-flex align-items-center fw-bold m-0 text-dark">
            <img src="/logo.png" alt="Logo" style={{ height: '40px', marginRight: '15px' }} onError={(e) => e.target.style.display = 'none'} />
            ASSALTAR AS NUVENS
          </Navbar.Brand>
          <div className="d-flex gap-2">
            <Button variant="light" className="fw-semibold shadow-sm rounded-3 btn-sm px-3">
              Guia de Mapeamento
            </Button>
            <Button variant="dark" className="fw-semibold shadow-sm rounded-3 btn-sm px-3 border-0" style={{ backgroundColor: '#2b2b2b' }} onClick={() => alert("Dica: Para adicionar, basta clicar em qualquer local do mapa!")}>
              + Adicionar Ponto
            </Button>
          </div>
        </Container>
      </Navbar>

      <Container fluid className="flex-grow-1 p-3 p-md-4 overflow-hidden">
        <Row className="h-100 g-4">
          
          {/* MAPA */}
          <Col md={8} className="h-100">
            <Card className="h-100 border-0 shadow-sm rounded-4 p-1 bg-white">
              {/* Centro corrigido para o Campo Belo, Campinas */}
              <MapContainer center={[-23.005, -47.105]} zoom={15} zoomControl={true} style={{ cursor: 'crosshair', height: '100%', borderRadius: '0.8rem' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
                <MapClickHandler onMapClick={handleMapClick} />

                {pontos.map(p => (
                  <Marker key={p.id} position={[p.lat, p.lng]} icon={createCustomPin(p.cor)}>
                    <Popup className="rounded-3 shadow-sm border-0 p-0" minWidth={220}>
                      <div className="p-2">
                        <h6 className="fw-bold mb-2" style={{ color: p.cor }}>Categoria: {p.categoria}</h6>
                        <p className="mb-1" style={{ fontSize: '13px', color: '#495057' }}><strong>Data:</strong> {p.data}</p>
                        <p className="mb-0" style={{ fontSize: '13px', color: '#495057' }}><strong>Local:</strong> {p.desc}</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </Card>
          </Col>

          {/* PAINEL LATERAL */}
          <Col md={4} className="h-100 d-flex flex-column">
            <h5 className="fw-bold mb-3" style={{ color: '#495057' }}>Diagnóstico do Bairro</h5>
            <Row className="g-3 mb-4">
              <Col xs={6}>
                <Card className="border-0 shadow-sm text-center py-3 rounded-4 bg-white">
                  <Card.Body className="p-2">
                    <h2 className="fw-bold mb-0" style={{ color: '#c59dff', fontSize: '2.2rem' }}>{pontos.length}</h2>
                    <small className="text-muted fw-semibold">Total de Registros</small>
                  </Card.Body>
                </Card>
              </Col>
              <Col xs={6}>
                <Card className="border-0 shadow-sm text-center py-3 rounded-4 bg-white">
                  <Card.Body className="p-2">
                    <h2 className="fw-bold mb-0 text-warning" style={{ fontSize: '2.2rem' }}>{countLixo}</h2>
                    <small className="text-muted fw-semibold">Focos de Lixo</small>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <h6 className="fw-bold mb-3 text-muted text-uppercase" style={{ fontSize: '0.85rem' }}>Últimas Denúncias</h6>
            <div className="flex-grow-1 overflow-auto pe-2">
              {[...pontos].reverse().map(p => (
                <Card key={p.id} className="border-0 shadow-sm mb-3 rounded-4 bg-white">
                  <Card.Body className="p-3">
                    <div className="d-flex align-items-center mb-1">
                      <span style={{ width: '14px', height: '14px', backgroundColor: p.cor, borderRadius: '50%', marginRight: '10px' }}></span>
                      <strong style={{ color: '#333' }}>{p.categoria}</strong>
                    </div>
                    <small className="text-muted ms-4 d-block lh-sm">{p.desc}</small>
                    {p.imagemUrl && (
                      <img src={p.imagemUrl} alt={`Evidência: ${p.categoria}`} className="evidence-thumbnail mt-3" />
                    )}
                  </Card.Body>
                </Card>
              ))}
            </div>

            <Card className="border-0 shadow-sm mt-3 bg-white rounded-4">
              <Card.Body className="p-3 text-muted" style={{ fontSize: '0.85rem' }}>
                <p className="mb-1"><strong style={{ color: '#c59dff' }}>Projeto:</strong> Cartografia Climática Periférica</p>
                <p className="mb-0"><strong style={{ color: '#c59dff' }}>Local:</strong> Campo Belo (Campinas-SP)</p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>

      {/* MODAL DE ADIÇÃO DE PONTO (Formulário) */}
      <Modal show={showModal} onHide={handleCloseModal} centered backdrop="static">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold fs-5 text-dark">Registrar Nova Evidência</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-muted small">Categoria do Problema</Form.Label>
              <Form.Select value={novaCategoria} onChange={(e) => setNovaCategoria(e.target.value)} className="shadow-sm border-0 bg-light">
                <option value="Lixo">Acúmulo de Lixo</option>
                <option value="Asfalto">Ilha de Calor (Asfalto)</option>
                <option value="Esgoto a céu aberto">Esgoto a céu aberto</option>
                <option value="Árvores">Refúgio Verde (Árvores)</option>
                <option value="Outros">Outros</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-muted small">Imagem da Evidência</Form.Label>
              <Form.Control
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="shadow-sm border-0 bg-light"
              />
              <Form.Text className="text-muted">JPG, PNG ou WEBP, até 10 MB.</Form.Text>
              {imagemPreview && (
                <img src={imagemPreview} alt="Prévia da evidência" className="evidence-preview mt-2" />
              )}
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold text-muted small">Descrição do Local</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={3} 
                placeholder="Descreva o que está acontecendo..."
                value={novaDescricao}
                onChange={(e) => setNovaDescricao(e.target.value)}
                className="shadow-sm border-0 bg-light"
              />
            </Form.Group>
            
            {/* Aviso visual das coordenadas */}
            {draftLocation && (
              <div className="text-muted small mt-2 bg-light p-2 rounded border-0">
                <code className="text-dark">Lat: {draftLocation.lat.toFixed(5)} <br/>Lng: {draftLocation.lng.toFixed(5)}</code>
              </div>
            )}
          </Form>
          {erroSalvamento && <div className="alert alert-danger py-2 mb-0">{erroSalvamento}</div>}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button variant="light" onClick={handleCloseModal} className="fw-semibold">
            Cancelar
          </Button>
          <Button variant="dark" onClick={handleSavePoint} disabled={!novaDescricao.trim() || salvando} className="fw-semibold" style={{ backgroundColor: '#2b2b2b' }}>
            {salvando ? 'Salvando...' : 'Salvar Registro'}
          </Button>
        </Modal.Footer>
      </Modal>

    </div>
  );
}

export default App;