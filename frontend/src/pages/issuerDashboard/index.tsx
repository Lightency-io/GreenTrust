import { useState } from 'react';
import './style.css';
import { FaIdCard, FaBuilding, FaCalendarAlt, FaBolt, FaCog, FaRegFileAlt } from 'react-icons/fa';
import jsonData from '../../json/test.json';

interface Certificate {
    id: number;
    CIF: string;
    RazonSocial: string;
    FechaInicio: string;
    FechaFin: string;
    Tecnologia: string;
    Potencia: string;
    status: string;
}

function issuerDashboard() {
    const [data] = useState<Certificate[]>(jsonData);
    const [selectedObject, setSelectedObject] = useState<Certificate | null>(null);
    const [activeTab, setActiveTab] = useState<string>('issued');

    const handleRowClick = (item: Certificate) => {
        setSelectedObject(item);
    };

    const renderTabContent = (status: string) => {
        return (
            <div className="tab-content">
                {data.filter(item => item.status === status).map((item, index) => (
                    <div key={index} className="tab-item" onClick={() => handleRowClick(item)}>
                        {item.RazonSocial}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div className="container">
            <div className="tabs">
                <button className={activeTab === 'issued' ? 'active' : ''} onClick={() => setActiveTab('issued')}>Issued</button>
                <button className={activeTab === 'in_progress' ? 'active' : ''} onClick={() => setActiveTab('in_progress')}>In Progress</button>
                <button className={activeTab === 'rejected' ? 'active' : ''} onClick={() => setActiveTab('rejected')}>Rejected</button>
                <button className={activeTab === 'audited' ? 'active' : ''} onClick={() => setActiveTab('audited')}>Audited</button>
                <button className={activeTab === 'withdrawn' ? 'active' : ''} onClick={() => setActiveTab('withdrawn')}>Withdrawn</button>
            </div>
            {renderTabContent(activeTab)}
            <div>
                {selectedObject && (
                    <div className="details">
                        <h2>Certificate Details</h2>
                        <div className="detail-row">
                            <FaIdCard className="detail-icon" />
                            <span className="detail-label">ID:</span>
                            <span className="detail-value">{selectedObject.id}</span>
                        </div>
                        <div className="detail-row">
                            <FaBuilding className="detail-icon" />
                            <span className="detail-label">CIF:</span>
                            <span className="detail-value">{selectedObject.CIF}</span>
                        </div>
                        <div className="detail-row">
                            <FaRegFileAlt className="detail-icon" />
                            <span className="detail-label">Razon Social:</span>
                            <span className="detail-value">{selectedObject.RazonSocial}</span>
                        </div>
                        <div className="detail-row">
                            <FaCalendarAlt className="detail-icon" />
                            <span className="detail-label">Fecha Inicio:</span>
                            <span className="detail-value">
                                {new Date(parseInt(selectedObject.FechaInicio)).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="detail-row">
                            <FaCalendarAlt className="detail-icon" />
                            <span className="detail-label">Fecha Fin:</span>
                            <span className="detail-value">
                                {new Date(parseInt(selectedObject.FechaFin)).toLocaleDateString()}
                            </span>
                        </div>
                        <div className="detail-row">
                            <FaCog className="detail-icon" />
                            <span className="detail-label">Tecnologia:</span>
                            <span className="detail-value">{selectedObject.Tecnologia}</span>
                        </div>
                        <div className="detail-row">
                            <FaBolt className="detail-icon" />
                            <span className="detail-label">Potencia:</span>
                            <span className="detail-value">{selectedObject.Potencia}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default issuerDashboard;