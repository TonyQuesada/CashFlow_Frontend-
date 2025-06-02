import React from 'react';
import { FaTrashAlt, FaRegHeart, FaFilter } from 'react-icons/fa';
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import { HiSwitchHorizontal } from "react-icons/hi";

const ExplorerTemplate = ({
    animeList,
    favorites,
    genres,
    search,
    currentPage,
    hasNextPage,
    selectedCategories,
    isMobile,
    handleSearchChange,
    handleSearchClick,
    handleCategoryChange,
    handlePageChange,
    handleStatusChangeFavorite,
    confirmDeleteFavorite,
    getPageNumbers,
    typeShow,
    handleTypeChange
}) => {
    return (
        <div>
            <div className="filters">
                
                <Dropdown
                    value={typeShow}
                    options={[
                        { label: "Anime", value: "anime" },
                        { label: "Manga", value: "manga" },
                    ]}
                    onChange={(e) => handleTypeChange(e.value)}
                    placeholder={isMobile ? `<IoFilter className="filter-exp" />` : "Formato"}
                    className="w-full md:w-20rem"
                    optionLabel="label"
                    panelClassName="multiselect-fav"
                    showClear={isMobile ? false : true}
                    valueTemplate={isMobile ? <HiSwitchHorizontal  className="filter-exp" /> : typeShow.label }
                    emptyFilterMessage="No se encontraron resultados"
                />

                <input
                    type="text"
                    value={search}
                    onChange={handleSearchChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchClick()}
                    placeholder={`Buscar ${typeShow !== "" ? typeShow : "anime"}...`}
                    className="search-input"
                />

                <button onClick={handleSearchClick} className="search-button">Buscar</button>

                <MultiSelect
                    value={selectedCategories}
                    options={genres.map((genre) => ({
                        label: genre.name,
                        value: genre.id
                    }))}
                    onChange={(e) => handleCategoryChange(e.value)}
                    placeholder={isMobile ? <FaFilter className='filter-exp' /> : "Selecciona un género"}
                    maxSelectedLabels={isMobile ? 0 : 3}
                    className="w-full md:w-20rem"
                    optionLabel="label"
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
                                    {!favorite && (
                                        <button
                                            className="success-btn"
                                            onClick={() => handleStatusChangeFavorite(anime.mal_id)}
                                        >
                                            <span className='fav-span'>Agregar a Favoritos </span><FaRegHeart className="exp-icon"/>
                                        </button>
                                    )}

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

export default ExplorerTemplate;