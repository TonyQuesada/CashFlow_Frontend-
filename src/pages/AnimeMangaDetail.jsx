import React, { useEffect, useState, useCallback, useContext } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from "../context/UserContext";
import "../assets/styles/style.css";
import "../assets/styles/detail.css";
import { ClipLoader } from 'react-spinners';
import { Dropdown } from 'primereact/dropdown';
import { FaListCheck } from "react-icons/fa6";

const AnimeMangaDetail = React.memo(() => {
    const { id } = useParams();
    const [details, setDetails] = useState(null);
    const [episodes, setEpisodes] = useState([]);
    const [selectedEpisode, setSelectedEpisode] = useState(null);
    const [streamingLink, setStreamingLink] = useState(null);
    const [servers, setServers] = useState([]);
    const [selectedServer, setSelectedServer] = useState(null);
    const [iframeLoaded, setIframeLoaded] = useState(false);
    const [iframeLoading, setIframeLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const isMobile = window.innerWidth <= 768;

    const { user, logout } = useContext(UserContext);

    const API = process.env.REACT_APP_BACKEND_URL;

    useEffect(() => {
        if (!user) {
            logout();
        }

        const fetchDetails = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${API}/AnimeMangaDetail?user_id=${user.user_id}&anime_id=${id}`);
                setDetails(res.data);
        
                if (res.data.type === "anime") {
                    let episodesRes;
                    let sourceUsed;
    
                    // Intentar primero con jkanime
                    try {
                        console.log("Buscando en jkanime...");
                        episodesRes = await axios.get(`${API}/scrape-episodes`, {
                            params: { 
                                animeName: res.data.title,
                                source: "jkanime"
                            }
                        });
                        sourceUsed = "jkanime";
                    } catch (jkanimeError) {
                        console.warn("No se encontraron episodios en jkanime. Intentando con animeflv...", jkanimeError.message);

                        // Si falla jkanime, intentar con animeflv
                        try {
                            console.log("Buscando en animeflv...");
                            episodesRes = await axios.get(`${API}/scrape-episodes`, {
                                params: { 
                                    animeName: res.data.title,
                                    source: "animeflv"
                                }
                            });
                            sourceUsed = "animeflv";
                        } catch (animeflvError) {
                            console.error("No se encontraron episodios en animeflv:", animeflvError.message);
                            throw new Error("No se pudieron obtener episodios de ninguna fuente.");
                        }
                    }

                    console.log(`Episodios encontrados en ${sourceUsed}:`, episodesRes.data);

                    if (episodesRes.data.length > 0) {
                        //handleEpisodeClick(episodesRes.data[res.data.progress].link);
                        handleEpisodeClick(episodesRes.data[res.data.progress]?.link || episodesRes.data[0].link);
                    }
                    setEpisodes(episodesRes.data.reverse());
                }
            } catch (err) {
                console.error("Error al cargar los detalles del anime/manga:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, logout, id, API]);

    const handleEpisodeClick = useCallback(async (episodeLink) => {
        try {
            setIframeLoading(true); // Activar el spinner del iframe
            const streamingRes = await axios.get(`${API}/scrape-streaming`, {
                params: { url: episodeLink },
            });
            setStreamingLink(streamingRes.data.iframeSrc);
            setSelectedEpisode(episodeLink);
            setIframeLoaded(true);
    
            // Determinar si la fuente es JKanime
            const isJKanime = episodeLink.includes('jkanime.net');
    
            // Configurar servidores según la fuente
            const servers = [];
            const serverCount = isJKanime ? 10 : 6; // 10 servidores para JKanime, 6 para AnimeFLV
    
            for (let i = 0; i < serverCount; i++) {
                servers.push({
                    title: `Opción ${i + 1}`,
                    link: episodeLink + `#option${serverCount === 10 ? (i+1) : i}`,
                });
            }
    
            setServers(servers);
            setSelectedServer(streamingRes.data.iframeSrc);
    
            // Extraer el número del episodio del título (ejemplo: "Episodio 5")
            let episodeNumber = episodeLink.match(/-(\d+)$/)?.[1] || episodeLink.match(/\/(\d+)\/$/)?.[1];
            if (episodeNumber) {
                // Enviar el número del capítulo al endpoint UpdateChapter
                episodeNumber = episodeNumber - 1;
                await axios.put(`${API}/UpdateChapter`, {
                    user_id: user.user_id,
                    anime_id: id,
                    chapter: parseInt(episodeNumber, 10),
                });
            }
        } catch (err) {
            console.error("Error al cargar el episodio:", err);
        } finally {
            setIframeLoading(false);
        }
    }, [API, id, user]);

    const handleServerChange = useCallback(async (serverLink) => {
        try {
            setIframeLoading(true); // Activar el spinner del iframe
            const streamingRes = await axios.get(`${API}/scrape-streaming`, {
                params: { url: serverLink },
            });
            setSelectedServer(streamingRes.data.iframeSrc);
        } catch (err) {
            console.error("Error al cambiar de servidor:", err);
        } finally {
            setIframeLoading(false);
        }
    }, [API]);

    if (loading) {
        return (
            <div className="loading-container">
                <ClipLoader color="#00BFFF" size={50} />
                <p>Cargando...</p>
            </div>
        );
    }

    if (!details) return <div>No se encontraron detalles.</div>;

    return (
        <div className="detail-container">

            <div className="col-1">
                <h1 title={details.title} >{details.title}</h1>
                <img src={details.image_url} alt={details.title} />
                <p title={details.description} >{details.description}</p>
            </div>
            <div className="col-2">

                <div className="episodios">
                    <h2>Lista de Episodios: </h2>
                    {episodes.length > 0 ? (
                        <Dropdown
                            value={selectedEpisode}
                            options={episodes.map((episode) => ({
                                label: episode.title,
                                value: episode.link,
                            }))}
                            onChange={(e) => handleEpisodeClick(e.value)}
                            placeholder={isMobile ? <FaListCheck className="filter-exp" /> : "Selecciona un episodio"}
                            className="w-full md:w-20rem"
                            optionLabel="label"
                            filter
                            filterBy="label"
                            valueTemplate={isMobile ? <FaListCheck className="filter-exp" /> : selectedEpisode ? episodes.find(ep => ep.link === selectedEpisode)?.label : "Selecciona un episodio"}
                        />
                    ) : (
                        <h2 className="no-episodes">Por el momento, no se pueden visualizar este anime/manga.</h2>
                    )}
                </div>

                {episodes.length > 0 && (
                    <>
                        <div>
                            <div className="server-buttons">
                                {servers.map((server, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleServerChange(server.link)}
                                    >
                                        {server.title}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="content-iframe">
                            {iframeLoading && (
                                <div className="iframe-loading-overlay">
                                    <div className="iframe-spinner">
                                        <ClipLoader color="#00BFFF" size={50} />
                                    </div>
                                </div>
                            )}
                            <iframe
                                src={selectedServer}
                                width="1280"
                                height="720"
                                frameBorder="0"
                                allowFullScreen
                                title="Reproductor de video"
                                onLoad={() => setIframeLoading(false)}
                                style={{ display: iframeLoading ? "none" : "block" }}
                            ></iframe>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
});

export default AnimeMangaDetail;