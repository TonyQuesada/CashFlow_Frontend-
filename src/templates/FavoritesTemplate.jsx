import React from 'react';
import { FaTrashAlt, FaFilter } from 'react-icons/fa';
import { IoFilter } from "react-icons/io5";
import { MultiSelect } from 'primereact/multiselect';
import { Dropdown } from 'primereact/dropdown';
import 'react-toastify/dist/ReactToastify.css';
import '../assets/styles/style.css';
import { HiSwitchHorizontal } from "react-icons/hi";

const FavoritesTemplate = ({
    statuses,
    statusFilter,
    search,
    currentPage,
    setCurrentPage,
    sortOrder,
    isMobile,
    handleSearchChange,
    handleStatusChange,
    handleSortChange,
    handleStatusChangeFavorite,
    confirmDeleteFavorite,
    getPageNumbers,
    currentItems,
    totalPages,
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
                    placeholder="Buscar favoritos..."
                    value={search}
                    onChange={handleSearchChange}
                    className="search-input"
                />

                <MultiSelect
                    value={statusFilter}
                    options={statuses.map((status) => ({
                        label: status.status_name,
                        value: status.status_id
                    }))}
                    onChange={(e) => handleStatusChange(e)}
                    placeholder= {isMobile ? <FaFilter className='filter-exp' /> : "Estado"}
                    maxSelectedLabels={isMobile ? 0 : 1} 
                    className="w-full md:w-20rem"
                    optionLabel="label"  // Especifica el label para mostrar
                    showClear={isMobile ? false : true}
                    panelClassName="multiselect-fav"
                    selectedItemsLabel={isMobile ? <FaFilter className='filter-exp' /> : `${statusFilter.length} estados`}
                    emptyFilterMessage="No se encontraron resultados"
                />

                <Dropdown
                    value={sortOrder}  // El valor seleccionado
                    options={[
                        { label: "Nombre", value: "name" },
                        { label: "Fecha de agregado", value: "dateAdded" },
                    ]}
                    onChange={(e) => handleSortChange(e.value)}  // Cuando se selecciona una nueva opción
                    placeholder={isMobile ? `<IoFilter className="filter-exp" />` : "Ordenar"}
                    className="w-full md:w-20rem"
                    optionLabel="label"
                    panelClassName="multiselect-fav"
                    showClear={isMobile ? false : true}
                    valueTemplate={isMobile ? <IoFilter className="filter-exp" /> : sortOrder.label }
                    emptyFilterMessage="No se encontraron resultados"
                />
            </div>

            <div className="favoritos">
                {currentItems.map(favorito => (
                    <div className="favorito" key={favorito.anime_id}>
                        {favorito.image_url && <img src={favorito.image_url} alt={favorito.title} />}

                        <div className="favorito-contenido">
                            <h2>{favorito.title}</h2>
                            <p>{favorito.description}</p>

                            <div className="status-container">

                                {/* Select para cambiar el estado */}
                                <Dropdown
                                    value={favorito.status_id} // El valor seleccionado
                                    options={statuses.map((status) => ({
                                        label: status.status_name,
                                        value: status.status_id,
                                    }))} // Opciones del dropdown
                                    onChange={(e) => handleStatusChangeFavorite(favorito.anime_id, parseInt(e.value)) } // Evento cuando cambie la selección
                                    className="w-full md:w-20rem status-dropdown" // Clases personalizadas
                                    panelClassName="dropdown-panel" // Panel de opciones
                                />

                                {/* Botón de eliminar favorito */}
                                <button
                                    className="delete-btn-fav"
                                    onClick={() => confirmDeleteFavorite(favorito.anime_id)}
                                >
                                    <FaTrashAlt className="fav-icon"/>
                                </button>
                            </div>
                        </div>

                    </div>
                ))}
            </div>

            {/* Paginación */}
            <div className="pagination">
                {/* Botón de "Anterior" */}
                <button 
                    hidden={currentPage === 1 || totalPages === 0}
                    onClick={() => setCurrentPage(currentPage - 1)}
                >
                    &lt;&lt;
                </button>

                {/* Números de páginas */}
                {getPageNumbers().map((page, index) => (
                    page === "..." ? (
                        <span key={index} className="dots">...</span>
                    ) : (
                        <button
                            key={index}
                            onClick={() => setCurrentPage(page)}
                            className={page === currentPage ? "active" : ""}
                        >
                            {page}
                        </button>
                    )
                ))}

                {/* Botón de "Siguiente" */}
                <button 
                    hidden={currentPage === totalPages || totalPages === 0}
                    onClick={() => setCurrentPage(currentPage + 1)}
                >
                    &gt;&gt;
                </button>
            </div>

        </div>
    );
};

export default FavoritesTemplate;
