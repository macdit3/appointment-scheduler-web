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
