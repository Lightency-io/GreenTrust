import { useNavigate } from "react-router-dom";
import "./HomePage.css";
import { WalletSelector } from "@aptos-labs/wallet-adapter-ant-design";
import "@aptos-labs/wallet-adapter-ant-design/dist/index.css";
import {Col} from "antd";

function HomePage() {
    const navigate = useNavigate();

    return (
        <>
        <div className="upload-page">
            {/* Header with button aligned to the right */}
            <header className="header">
                <h1>GreenTrust</h1>
                <Col span={12} style={{ textAlign: "right", paddingRight: "200px" }}>
                    <WalletSelector />
                </Col>
            </header>

            {/* Connect Section */}
            <section className="connect-section">
                
                    {/* Connect as CNMS */}
                  

                    {/* Connect qs Nexus */}
                    <div className="connect-card">
                        <h3>Use our solution</h3>
                        <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed et ex non sem rhoncus pellentesque quis non lorem. 
                        </p>
                        <button className="connect-button" onClick={() => navigate(`/auth`)}>Continue</button>
                    </div>

                   
                

                {/* Divider */}

                

                {/* About Section */}
                <section className="about-section">
                    <h2>About Us</h2>
                    <p>
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed et ex non sem rhoncus pellentesque quis non lorem. Mauris ornare feugiat facilisis. Aliquam ornare lectus quis nisl egestas, in consequat nulla finibus. Aliquam facilisis enim ut eros sollicitudin congue. Vivamus vulputate vehicula tempor. Duis fringilla quam ac pulvinar lobortis. Maecenas viverra aliquam lorem, et posuere augue ultricies sed. Ut nec odio ac tortor molestie semper. Nam aliquet viverra orci, non imperdiet orci ultricies at. Donec cursus elit ut est eleifend blandit. Nullam pulvinar lorem sed ante laoreet, vitae tristique ipsum egestas. In hac habitasse platea dictumst. Nullam sed gravida arcu.
                    </p>
                </section>

            </section>
        </div>
        </>
    );
}

export default HomePage;