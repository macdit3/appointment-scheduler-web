document.addEventListener('alpine:init', () => {
    Alpine.data('businessApp', () => ({
        businesses: [],
        filteredBusinesses: [],
        searchQuery: '',
        currentPage: 1,
        itemsPerPage: 6,
        sortColumn: 'id',
        sortDirection: 'asc',
        isLoading: true,
        isModalOpen: false,
        isDeleteModalOpen: false,
        modalMode: 'add', // 'add', 'edit', 'view'
        formData: {
            id: null,
            name: '',
            address: '',
            phone: '',
            email: '',
            website: '',
            timezone: '',
            cancellation_policy: '',
            created_at: null,
            updated_at: null
        },
        deleteBusinessId: null,
        deleteBusinessName: '',
        showToast: false,
        toastMessage: '',
        toastType: 'success',

        init() {
            this.fetchBusinesses();

            this.$watch('searchQuery', () => {
                this.filterBusinesses();
            });
        },

        fetchBusinesses() {
            this.isLoading = true;

            fetch('https://appointment-scheduler-backend-smss.onrender.com/businesses/')
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    this.businesses = data;
                    this.filterBusinesses();
                    this.isLoading = false;
                })
                .catch(error => {
                    console.error('Error fetching businesses:', error);
                    this.displayToast('Failed to load businesses. Please try again later.', 'error');
                    this.isLoading = false;
                });
        },

        filterBusinesses() {
            if (!this.searchQuery) {
                this.filteredBusinesses = [...this.businesses];
            } else {
                const query = this.searchQuery.toLowerCase();
                this.filteredBusinesses = this.businesses.filter(business => {
                    return (
                        business.id.toString().includes(query) ||
                        business.name.toLowerCase().includes(query) ||
                        business.address.toLowerCase().includes(query) ||
                        business.phone.toLowerCase().includes(query) ||
                        business.email.toLowerCase().includes(query) ||
                        (business.website && business.website.toLowerCase().includes(query))
                    );
                });
            }

            this.sortBusinesses();
        },

        sortBusinesses() {
            this.filteredBusinesses.sort((a, b) => {
                let aValue = a[this.sortColumn];
                let bValue = b[this.sortColumn];

                // Handle numeric values
                if (this.sortColumn === 'id') {
                    aValue = Number(aValue);
                    bValue = Number(bValue);
                } else if (typeof aValue === 'string' && typeof bValue === 'string') {
                    aValue = aValue.toLowerCase();
                    bValue = bValue.toLowerCase();
                }

                if (aValue < bValue) {
                    return this.sortDirection === 'asc' ? -1 : 1;
                }
                if (aValue > bValue) {
                    return this.sortDirection === 'asc' ? 1 : -1;
                }
                return 0;
            });
        },

        sortBy(column) {
            if (this.sortColumn === column) {
                this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortColumn = column;
                this.sortDirection = 'asc';
            }

            this.sortBusinesses();
        },

        get paginatedBusinesses() {
            const startIndex = (this.currentPage - 1) * this.itemsPerPage;
            const endIndex = startIndex + this.itemsPerPage;
            return this.filteredBusinesses.slice(startIndex, endIndex);
        },

        get totalPages() {
            return Math.max(1, Math.ceil(this.filteredBusinesses.length / this.itemsPerPage));
        },

        prevPage() {
            if (this.currentPage > 1) {
                this.currentPage--;
            }
        },

        nextPage() {
            if (this.currentPage < this.totalPages) {
                this.currentPage++;
            }
        },

        goToPage(page) {
            if (page >= 1 && page <= this.totalPages) {
                this.currentPage = page;
            }
        },

        resetFilters() {
            this.searchQuery = '';
            this.currentPage = 1;
            this.sortColumn = 'id';
            this.sortDirection = 'asc';
            this.filterBusinesses();
        },

        openAddModal() {
            this.modalMode = 'add';
            this.formData = {
                id: null,
                name: '',
                address: '',
                phone: '',
                email: '',
                website: '',
                timezone: '',
                cancellation_policy: '',
                created_at: null,
                updated_at: null
            };
            this.isModalOpen = true;
        },

        openEditModal(business) {
            this.modalMode = 'edit';
            this.formData = { ...business };
            this.isModalOpen = true;
        },

        openViewModal(business) {
            this.modalMode = 'view';
            this.formData = { ...business };
            this.isModalOpen = true;
        },

        closeModal() {
            this.isModalOpen = false;
        },

        submitForm() {
            if (this.modalMode === 'add') {
                this.addBusiness();
            } else if (this.modalMode === 'edit') {
                this.updateBusiness();
            }
        },

        addBusiness() {
            this.isLoading = true;

            fetch('https://appointment-scheduler-backend-smss.onrender.com/businesses/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(this.formData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    this.fetchBusinesses();
                    this.closeModal();
                    this.displayToast('Business added successfully!', 'success');
                })
                .catch(error => {
                    console.error('Error adding business:', error);
                    this.displayToast('Failed to add business. Please try again.', 'error');
                    this.isLoading = false;
                });
        },

        updateBusiness() {
            this.isLoading = true;

            // Create a copy of formData without created_at and updated_at
            const updateData = { ...this.formData };
            delete updateData.created_at;
            delete updateData.updated_at;

            fetch(`https://appointment-scheduler-backend-smss.onrender.com/businesses/${this.formData.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    this.fetchBusinesses();
                    this.closeModal();
                    this.displayToast('Business updated successfully!', 'success');
                })
                .catch(error => {
                    console.error('Error updating business:', error);
                    this.displayToast('Failed to update business. Please try again.', 'error');
                    this.isLoading = false;
                });
        },

        openDeleteModal(business) {
            this.deleteBusinessId = business.id;
            this.deleteBusinessName = business.name;
            this.isDeleteModalOpen = true;
        },

        closeDeleteModal() {
            this.isDeleteModalOpen = false;
            this.deleteBusinessId = null;
            this.deleteBusinessName = '';
        },

        deleteBusiness() {
            this.isLoading = true;

            fetch(`https://appointment-scheduler-backend-smss.onrender.com/businesses/${this.deleteBusinessId}`, {
                method: 'DELETE'
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.text();
                })
                .then(() => {
                    this.fetchBusinesses();
                    this.closeDeleteModal();
                    this.displayToast('Business deleted successfully!', 'success');
                })
                .catch(error => {
                    console.error('Error deleting business:', error);
                    this.displayToast('Failed to delete business. Please try again.', 'error');
                    this.isLoading = false;
                });
        },

        displayToast(message, type = 'success') {
            this.toastMessage = message;
            this.toastType = type;
            this.showToast = true;

            setTimeout(() => {
                this.showToast = false;
            }, 3000);
        },

        formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleString();
        }
    }));
});