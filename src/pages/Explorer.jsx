import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { UserContext } from "../context/UserContext";
import ExplorerTemplate from '../templates/ExplorerTemplate';

const Explorer = () => {

    const { user, logout } = useContext(UserContext);
    const API = process.env.REACT_APP_BACKEND_URL;

    const [animeList, setAnimeList] = useState([]);
    const [favorites, setFavorites] = useState([]);
    const [genres, setGenres] = useState([]);
    const [search, setSearch] = useState('');
    const [typeShow, setTypeShow] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [hasNextPage, setHasNextPage] = useState(false);
    const [itemsPerPage, setItemsPerPage] = useState(Infinity);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isItemsPerPageReady, setIsItemsPerPageReady] = useState(false);

    useEffect(() => {
        const updateItemsPerPage = () => {
            const width = window.innerWidth;
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
                { maxWidth: Infinity, items: 28 },
            ];
            const matchedRange = ranges.find(range => width <= range.maxWidth);
            if (matchedRange) {
                setItemsPerPage(matchedRange.items);
                setIsItemsPerPageReady(true); // Indicar que itemsPerPage está listo
            }
        };

        updateItemsPerPage(); // Calcular itemsPerPage inmediatamente
        window.addEventListener('resize', updateItemsPerPage);
        return () => window.removeEventListener('resize', updateItemsPerPage);
    }, []);

    useEffect(() => {
        if (isItemsPerPageReady) {
            setCurrentPage(1);
            fetchAnime(1, selectedCategories);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [itemsPerPage, isItemsPerPageReady]);
    
    useEffect(() => {
        if (isItemsPerPageReady) {
            setCurrentPage(1);
            fetchAnime(1, selectedCategories);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [typeShow, isItemsPerPageReady]);

    useEffect(() => {
        if (!user) {
            logout();
        }

        const fetchFavorites = async () => {
            try {
                const res = await axios.get(`${API}/Favorites?user_id=${user.user_id}&type=${typeShow}`);
                setFavorites(res.data);
            } catch (err) {
                console.log(err);
            }
        };

        const fetchGenres = async () => {
            try {
                const res = await axios.get(`${API}/GenresAnime`);
                setGenres(res.data);
            } catch (err) {
                console.log(err);
            }
        };

        fetchFavorites();
        fetchGenres();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, logout, typeShow]);
    
    const fetchAnime = async (page = 1, selectedCategories = []) => {
        setAnimeList([]);

        try {
            let baseUrl = 'https://api.jikan.moe/v4';
            const queryParams = new URLSearchParams({
                page: page,
                limit: 25,
                sort: 'desc',
            });
            
            if(typeShow === "anime" || typeShow === ""){

                queryParams.append('order_by', 'scored_by');
                // queryParams.append('min_episodes', 1);

                if (search.length === 0 && selectedCategories.length === 0) {
                    baseUrl += '/seasons/now';
                    queryParams.append('status', 'airing');
                }else{
                    baseUrl += typeShow ? `/${typeShow}` : '/anime';
                    
                    if (search.length > 0) {
                        queryParams.append('q', search);
                    }
                    
                    if (selectedCategories.length > 0) {
                        queryParams.append('genres', selectedCategories.join(','));
                    }
                }                    
            }else if(typeShow === "manga"){
                baseUrl += `/${typeShow}`;
                queryParams.append('order_by', 'scored_by');

                if (search.length > 0) {
                    queryParams.append('q', search);
                }
    
                if (selectedCategories.length > 0) {
                    queryParams.append('genres', selectedCategories.join(','));
                }
            }

            if (user.sfw === 1) {
                queryParams.append('sfw', true);
            }

            const res = await axios.get(`${baseUrl}?${queryParams.toString()}`);

            if (res.data && res.data.data) {
                const uniqueAnimes = res.data.data.filter((anime, index, self) =>
                    index === self.findIndex((a) => (
                        a.mal_id === anime.mal_id
                    ))
                );

                let orderedAnimes = uniqueAnimes;
                if (search.length > 0) {
                    orderedAnimes = uniqueAnimes.sort((a, b) => {
                        const getMatchScore = (anime) => {
                            const titles = anime.titles.map((t) => t.title.toLowerCase());
                            const searchTerm = search.toLowerCase();
                            let maxScore = 0;
    
                            titles.forEach(title => {
                                const index = title.indexOf(searchTerm);
                                if (index !== -1) {
                                    
                                    const positionScore = 1 / (index + 1);
                                    
                                    const lengthScore = searchTerm.length / title.length;
                                    
                                    const totalScore = positionScore + lengthScore;
                                    if (totalScore > maxScore) {
                                        maxScore = totalScore;
                                    }
                                }
                            });
    
                            return maxScore;
                        };
    
                        const aScore = getMatchScore(a);
                        const bScore = getMatchScore(b);
    
                        if (aScore !== bScore) return bScore - aScore;
    
                        const aDefaultTitle = a.titles.find((t) => t.type === "Default")?.title || "";
                        const bDefaultTitle = b.titles.find((t) => t.type === "Default")?.title || "";
                        return aDefaultTitle.localeCompare(bDefaultTitle);
                    });
                }

                const paginatedAnimes = orderedAnimes.slice(0, itemsPerPage);
                setAnimeList(paginatedAnimes);
                setHasNextPage(res.data.pagination.has_next_page);
            } else {
                console.error("Error: La respuesta no contiene 'data'.");
            }
        } catch (err) {
            console.log(err);
        }
    };

    const handleTypeChange = (value) => { setTypeShow(value); };
    const handleSearchChange = (e) => { setSearch(e.target.value); };
    const handleSearchClick = () => { setCurrentPage(1); fetchAnime(1, selectedCategories); };
    const handleCategoryChange = (selectedValues) => {
        setSelectedCategories(selectedValues);
        setCurrentPage(1);
        fetchAnime(1, selectedValues);
    };
    const handlePageChange = (page) => { 
        setCurrentPage(page); 
        fetchAnime(page, selectedCategories); 
    };

    const handleStatusChangeFavorite = async (anime_id) => {
        try {
            const response = await fetch(`https://api.jikan.moe/v4/${typeShow === "manga" ? typeShow : "anime"}/${anime_id}`);
            const animeDetails = await response.json();

            if (!animeDetails || !animeDetails.data) {
                console.error("No se encontraron detalles para el anime con ID:", anime_id);
                return;
            }

            const anime = animeDetails.data;

            await axios.put(`${API}/Favorites/AddOrUpdate`, {
                api_id: anime.mal_id,
                title: anime.title || "Título no disponible",
                synopsis: anime.synopsis || "Sinopsis no disponible",
                image_url: anime.images?.jpg?.large_image_url || "",
                user_id: user.user_id,
                status_id: "0",
                year: typeShow === "manga" ? (anime.published?.prop?.from?.year || "No definido") : (anime.aired?.prop?.from?.year || "No definido"),
                title_english: anime.title_english || "Título no disponible",
                type: typeShow === "manga" ? typeShow : "anime"
            }).catch(err => {
                console.error("Error en la solicitud axios:", err.response || err.message);
            });

            const existingFavorite = favorites.find(fav => fav.api_id === anime_id);
            var isNewFavorite = !existingFavorite;

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

            if (isNewFavorite) {
                toast.success(`El ${typeShow === "manga" ? typeShow : "anime"} "${anime.title}" fue agregado a favoritos`);
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
                data: { 
                    user_id: user.user_id,
                    type: typeShow === "manga" ? typeShow : "anime"
                 },
            });

            setFavorites(favorites.filter(fav => fav.api_id !== anime_id));

            // Obtener el título del anime o manga que se está eliminando
            const animeToDelete = favorites.find(fav => fav.api_id === anime_id);
            const title = animeToDelete ? animeToDelete.title : "";

            // Mostrar la alerta de éxito
            toast.success(`El ${typeShow === "manga" ? typeShow : "anime"} "${title}" fue eliminado de favoritos`);
        } catch (err) {
            console.log(err);
            toast.error(`Hubo un error al eliminar el ${typeShow === "manga" ? typeShow : "anime"} de favoritos`);
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
                        toast.dismiss();
                    }}
                >
                    Sí
                </button>
                <button
                    className="toast-cancel-btn"
                    onClick={() => toast.dismiss()}
                >
                    No
                </button>
            </div>,
            {
                position: "top-center",
                autoClose: false,
                closeOnClick: false,
                draggable: false,
                closeButton: false,
                className: "toast-confirmation",
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
        <ExplorerTemplate
            animeList={animeList}
            favorites={favorites}
            genres={genres}
            search={search}
            currentPage={currentPage}
            hasNextPage={hasNextPage}
            selectedCategories={selectedCategories}
            isMobile={isMobile}
            handleSearchChange={handleSearchChange}
            handleSearchClick={handleSearchClick}
            handleCategoryChange={handleCategoryChange}
            handlePageChange={handlePageChange}
            handleStatusChangeFavorite={handleStatusChangeFavorite}
            confirmDeleteFavorite={confirmDeleteFavorite}
            getPageNumbers={getPageNumbers}
            typeShow={typeShow}
            handleTypeChange={handleTypeChange}
        />
    );
};

export default Explorer;