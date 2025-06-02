import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify'; // Importar Toastify
import 'react-toastify/dist/ReactToastify.css'; // Estilos de Toastify
import { UserContext } from "../context/UserContext";
import { FaTrashAlt, FaRegHeart, FaFilter  } from 'react-icons/fa';
import '../assets/styles/style.css';
import { MultiSelect } from 'primereact/multiselect';
        

const Explorer = () => {

    const { user, logout } = useContext(UserContext);
    const API = process.env.REACT_APP_BACKEND_URL;

    const [animeList, setAnimeList] = useState([]);  // Lista de animes obtenidos
    const [favorites, setFavorites] = useState([]);
    const [statuses, setStatuses] = useState([]);
    const [genres, setGenres] = useState([]);  // Estado para los géneros
    const [search, setSearch] = useState('');  // Campo de búsqueda
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);  // Indica si hay más páginas
    const [itemsPerPage, setItemsPerPage] = useState(Infinity);    
    const [selectedCategories, setSelectedCategories] = useState([]); // Estado para categorías seleccionadas

    useEffect(() => {
        const updateItemsPerPage = () => {
            const width = window.innerWidth;
    
            // Definimos los rangos y valores en un arreglo
            const ranges = [
                { maxWidth: 595, items: 16 },
                { maxWidth: 799, items: 12 },
                { maxWidth: 995, items: 8 },
                { maxWidth: 1191, items: 15 },
                { maxWidth: 1387, items: 18 },
                { maxWidth: 1582, items: 14 },
                { maxWidth: 1780, items: 16 },
                { maxWidth: 1976, items: 18 },
                { maxWidth: 2171, items: 20 },
                { maxWidth: 2367, items: 22 },
                { maxWidth: 2563, items: 24 },
                { maxWidth: 2759, items: 26 },
                { maxWidth: Infinity, items: 28 }, // Cualquier valor mayor
            ];
    
            // Buscamos el primer rango que coincide
            const matchedRange = ranges.find(range => width <= range.maxWidth);
            if (matchedRange) setItemsPerPage(matchedRange.items);
        };
    
        updateItemsPerPage(); // Llamada inicial
        window.addEventListener('resize', updateItemsPerPage); // Actualiza al cambiar tamaño de ventana
    
        return () => window.removeEventListener('resize', updateItemsPerPage); // Limpieza del evento
    }, []);

    useEffect(() => {
        // Actualiza la lista de animes cada vez que `itemsPerPage` cambie
        setCurrentPage(1); // Resetea a la primera página
        fetchAnime(1, selectedCategories); // Vuelve a hacer la llamada al API con los nuevos límites
    }, [itemsPerPage]);
    
    useEffect(() => {
        if (!user) {
            logout();
        }

        const fetchStatuses = async () => {
            try {
                const res = await axios.get(`${API}/StatusesAnime`);
                setStatuses(res.data);
            } catch (err) {
                console.log(err);
            }
        };

        const fetchFavorites = async () => {
            try {
                const res = await axios.get(`${API}/Favorites?user_id=${user.user_id}`);
                setFavorites(res.data);
            } catch (err) {
                console.log(err);
            }
        };

        const fetchGenres = async () => {
            try {
                const res = await axios.get(`${API}/GenresAnime`);
                setGenres(res.data);  // Almacena los géneros obtenidos
            } catch (err) {
                console.log(err);
            }
        };

        fetchStatuses();
        fetchFavorites();
        fetchGenres();
        
    }, [user, logout]);

    const fetchAnime = async (page = 1, selectedCategories = []) => {

        // Limpiar datos anteriores antes de hacer la solicitud
        setAnimeList([]);

        try { 
            // Construir la URL de la API correctamente
            let baseUrl = 'https://api.jikan.moe/v4';

            const queryParams = new URLSearchParams({
                page: page,
                limit: 25,
                order_by: 'episodes',
                sort: 'desc',
                min_episodes: 1,
            });

            if (search.length > 0) {
                baseUrl += '/anime';
                queryParams.append('q', search);
            }

            if (selectedCategories.length > 0) {
                baseUrl += '/anime';
                queryParams.append('genres', selectedCategories.join(','));
            }
            
            // Si no hay búsqueda ni categorías seleccionadas, agregar los parámetros por defecto
            if (search.length === 0 && selectedCategories.length === 0) {
                baseUrl += '/seasons/now';
                queryParams.append('status', 'airing');  // Agregar status por defecto
            }

            if (user.sfw === 1) {
                queryParams.append('sfw', true);
            }

            // Realizar la solicitud con la URL construida
            const res = await axios.get(`${baseUrl}?${queryParams.toString()}`);

            // Verificar si 'data' existe en la respuesta
            if (res.data && res.data.data) {
                // Filtrar duplicados basado en mal_id
                const uniqueAnimes = res.data.data.filter((anime, index, self) =>
                    index === self.findIndex((a) => (
                        a.mal_id === anime.mal_id // Filtra por mal_id para evitar duplicados
                    ))
                );

                // Ordenar los resultados si hay un término de búsqueda
                let orderedAnimes = uniqueAnimes;
                if (search.length > 0) {
                    orderedAnimes = uniqueAnimes.sort((a, b) => {
                        const getMatchScore = (anime) => {
                            // Busca coincidencias en todos los títulos (Default, Japanese, English)
                            const titles = anime.titles.map((t) => t.title.toLowerCase());
                            const matches = titles.filter((t) => t.includes(search.toLowerCase()));
                            return matches.length > 0 ? 1 : 0;
                        };

                        // Obtener puntuaciones para las coincidencias
                        const aScore = getMatchScore(a);
                        const bScore = getMatchScore(b);

                        // Priorizar animes con coincidencias
                        if (aScore !== bScore) return bScore - aScore;

                        // Si ambos tienen el mismo score, ordenar alfabéticamente por título por defecto
                        const aDefaultTitle = a.titles.find((t) => t.type === "Default")?.title || "";
                        const bDefaultTitle = b.titles.find((t) => t.type === "Default")?.title || "";
                        return aDefaultTitle.localeCompare(bDefaultTitle);
                    });
                }

                // Limitar la cantidad de animes a `itemsPerPage`
                const paginatedAnimes = orderedAnimes.slice(0, itemsPerPage);

                // Actualizamos la lista de animes
                setAnimeList(paginatedAnimes);
                setHasNextPage(res.data.pagination.has_next_page); // Actualiza si hay más páginas
            } else {
                console.error("Error: La respuesta no contiene 'data'.");
            }

        } catch (err) {
            console.log(err);
        }
    };

    const handleSearchChange = (e) => { setSearch(e.target.value); };

    const handleSearchClick = () => {
        setCurrentPage(1);
        fetchAnime(1, selectedCategories);
    };

    const handleCategoryChange = (selectedValues) => {
        setSelectedCategories(selectedValues); // Actualiza las categorías seleccionadas
        setCurrentPage(1);  // Resetea a la primera página cuando se cambian los géneros
        fetchAnime(1, selectedValues);  // Pasa selectedValues directamente a fetchAnime
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchAnime(page, selectedCategories);
    };

    const handleStatusChangeFavorite = async (anime_id) => {
        try {

            // Realizar la solicitud a la API de Jikan para obtener los detalles del anime
            const response = await fetch(`https://api.jikan.moe/v4/anime/${anime_id}`);
            const animeDetails = await response.json();
    
            // Si no se encuentra el anime, salimos
            if (!animeDetails || !animeDetails.data) {
                console.error("No se encontraron detalles para el anime con ID:", anime_id);
                return;
            }

            // Extraer los detalles necesarios
            const anime = animeDetails.data;
            
            await axios.put(`${API}/Favorites/AddOrUpdate`, {
                api_id: anime.mal_id,
                title: anime.title || "Título no disponible",
                synopsis: anime.synopsis || "Sinopsis no disponible",
                image_url: anime.images?.jpg?.large_image_url || "",
                user_id: user.user_id,
                status_id: "0",
                year: anime.aired?.prop?.from?.year || "No definido",
                title_english: anime.title_english || "Título no disponible",
            }).catch(err => {
                console.error("Error en la solicitud axios:", err.response || err.message);
            });

            const existingFavorite = favorites.find(fav => fav.api_id === anime_id);
            var isNewFavorite = !existingFavorite;

            // Actualizar la lista de favoritos localmente
            setFavorites(prev => {
                const favoriteExists = prev.find(fav => fav.api_id === anime_id);
                if (favoriteExists) {
                    return prev.map(fav =>
                        fav.api_id === anime_id ? { ...fav, status_id: 0 } : fav
                    );
                } else {
                    return [
                        ...prev,
                        { anime_id, status_id: 0, api_id: anime_id, title: anime.title },
                    ];
                }
            });

            // Mostrar la alerta solo después de la actualización exitosa
            if (isNewFavorite) {
                toast.success(`El anime "${anime.title}" fue agregado a favoritos`);
            } else {
                toast.success(`El estado de "${anime.title}" fue actualizado`);
            }

        } catch (err) {
            console.error('Error al cambiar el estado del favorito:', err.message);
        }
    };
        
    const handleDeleteFavorite = async (anime_id) => {
        try {
            await axios.delete(`${API}/Favorites/API_id/${anime_id}`, {
                data: { user_id: user.user_id },
            });

            setFavorites(favorites.filter(fav => fav.api_id !== anime_id));
        } catch (err) {
            console.log(err);
        }
    };
    
    const confirmDeleteFavorite = (anime_id) => {
        toast(
            <div>
                <p>¿Estás seguro de eliminar este favorito?</p>
                <button
                    className="toast-confirm-btn"
                    onClick={() => {
                        handleDeleteFavorite(anime_id);
                        toast.dismiss(); // Cierra el toast manualmente
                    }}
                >
                    Sí
                </button>
                <button
                    className="toast-cancel-btn"
                    onClick={() => toast.dismiss()} // Cierra el toast si se cancela
                >
                    No
                </button>
            </div>,
            {
                position: "top-center",
                autoClose: false, // Mantén el toast abierto hasta que se confirme o cancele
                closeOnClick: false,
                draggable: false,
                closeButton: false,
                className: "toast-confirmation", // Clase CSS personalizada (opcional)
            }
        );
    };

    const getPageNumbers = () => {
        const pages = [];
        const delta = 1;

        if (currentPage > delta + 1) {
            pages.push(1);
            if (currentPage > delta + 2) pages.push('...');
        }

        for (let i = Math.max(currentPage - delta, 1); i <= currentPage; i++) {
            pages.push(i);
        }

        if (hasNextPage) {
            pages.push(currentPage + 1);
        }

        return pages;
    };
    
    const isMobile = window.innerWidth <= 768;

    return (
        <div>
            <div className="filters">
                <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()} // Detecta Enter
                    placeholder="Buscar animes..."
                    className="search-input"
                />

                <button onClick={handleSearchClick} className="search-button">Buscar</button>

                {/* Select para categorías múltiples */}    
                <MultiSelect
                    value={selectedCategories}
                    options={genres.map((genre) => ({
                        label: genre.name,
                        value: genre.id
                    }))}
                    onChange={(e) => handleCategoryChange(e.value)}
                    placeholder= {isMobile ? <FaFilter className='filter-exp' /> : "Selecciona un género"}
                    maxSelectedLabels={isMobile ? 0 : 3} 
                    className="w-full md:w-20rem"
                    optionLabel="label"  // Especifica el label para mostrar
                    filterBy="label"
                    filter                        
                    showClear={isMobile ? false : true}
                    panelClassName="multiselect-exp"
                    selectedItemsLabel={isMobile ? <FaFilter className='filter-exp' /> : `${selectedCategories.length} géneros seleccionados`}
                    emptyFilterMessage="No se encontraron resultados"
                />                

            </div>

            <div className="favoritos">
                {animeList.map((anime) => {
                    const favorite = favorites.find(fav => fav.api_id === anime.mal_id);

                    return (
                        <div className="favorito" key={anime.mal_id}>
                            {anime.images?.jpg?.large_image_url && (
                                <img src={anime.images.jpg.large_image_url} alt={anime.title} />
                            )}

                            <div className="favorito-contenido">
                                <h2>{anime.title ? anime.title : "Título no disponible"}</h2>
                                <p>{anime.synopsis ? anime.synopsis : "Sinopsis no disponible"}</p>

                            <div className="status-container">
                                {/* Botón de agregar */}
                                {!favorite && (
                                    <button
                                        className="success-btn"
                                        onClick={() => handleStatusChangeFavorite(anime.mal_id)} 
                                    >
                                        <span className='fav-span'>Agregar a Favoritos </span><FaRegHeart className="exp-icon"/>
                                    </button>
                                )}

                                {/* Botón de eliminar */}
                                {favorite && (
                                    <button
                                        className="delete-btn"
                                        onClick={() => confirmDeleteFavorite(anime.mal_id)}
                                    >
                                        <span className='fav-span'>Eliminar de Favoritos</span><FaTrashAlt className="exp-icon"/>
                                    </button>
                                )}
                            </div>
                        </div>
                        </div>
                    );
                })}
            </div>

            {/* Paginación */}
            <div className="pagination">
                <button
                    hidden={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                >
                    &lt;&lt;
                </button>

                {getPageNumbers().map((page, index) => (
                    page === "..." ? (
                        <span key={index} className="dots">...</span>
                    ) : (
                        <button
                            key={index}
                            onClick={() => handlePageChange(page)}
                            className={page === currentPage ? "active" : ""}
                        >
                            {page}
                        </button>
                    )
                ))}

                <button
                    hidden={!hasNextPage}
                    onClick={() => handlePageChange(currentPage + 1)}
                >
                    &gt;&gt;
                </button>
            </div>

        </div>
    );
};

export default Explorer;
