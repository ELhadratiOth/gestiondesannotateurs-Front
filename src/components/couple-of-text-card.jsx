import { useEffect, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Loader2, Tag, Search, Download } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import API from '../api';

// Fonction qui retourne une couleur basée sur le hash de la chaîne (plus générique)
const getLabelColor = label => {
  // Valeurs prédéfinies pour certains labels communs
  const predefinedColors = {
    ENTAILMENT: 'bg-green-100 text-green-800 hover:bg-green-100',
    CONTRADICTION: 'bg-red-100 text-red-800 hover:bg-red-100',
    NEUTRAL: 'bg-blue-100 text-blue-800 hover:bg-blue-100',
    POSITIVE: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
    NEGATIVE: 'bg-rose-100 text-rose-800 hover:bg-rose-100',
    NOT_YET: 'bg-gray-100 text-gray-800 hover:bg-gray-100',
  };

  // Si le label est dans les prédéfinis
  if (predefinedColors[label]) {
    return predefinedColors[label];
  }

  // Sinon, calculer une couleur basée sur le hash du label
  let hash = 0;
  for (let i = 0; i < label.length; i++) {
    hash = label.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = Math.abs(hash) % 360; // Valeur HSL entre 0-360
  return `bg-[hsl(${hue},85%,93%)] text-[hsl(${hue},75%,35%)]`;
};

export default function CoupleOfTextTable({ datasetId }) {
  const [coupleTexts, setCoupleTexts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [datasetInfo, setDatasetInfo] = useState(null);
  const pageSize = 10;

  // Récupérer les informations du dataset
  useEffect(() => {
    const fetchDatasetInfo = async () => {
      try {
        const response = await API.get(`/api/datasets/${datasetId}`);
        if (response.status === 200) {
          setDatasetInfo(response.data.data);
        }
      } catch (err) {
        console.error('Error fetching dataset info:', err);
      }
    };

    fetchDatasetInfo();
  }, [datasetId]);

  useEffect(() => {
    const fetchCoupleTexts = async () => {
      setLoading(true);
      try {
        const response = await API.get(
          `/api/coupletexts/${datasetId}?page=${currentPage}&size=${pageSize}`,
        );
        if (response.status === 200 && response.data.status === 'success') {
          // Mise à jour pour la nouvelle structure de données
          const {
            totalCount,
            totalPages,
            couples,
            currentPage: serverCurrentPage,
          } = response.data.data;

          setCoupleTexts(couples);
          setTotalCount(totalCount);
          setTotalPages(totalPages);

          // Mettre à jour currentPage seulement si c'est différent de ce qu'on a actuellement
          if (serverCurrentPage !== currentPage) {
            setCurrentPage(serverCurrentPage);
          }
        } else {
          setError('Error retrieving text pairs');
        }
      } catch (err) {
        console.error('Error fetching couple texts:', err);
        setError('Error retrieving text pairs');
      } finally {
        setLoading(false);
      }
    };

    fetchCoupleTexts();
  }, [datasetId, currentPage]);
  const handlePageChange = newPage => {
    if (newPage >= 0 && newPage < totalPages) {
      setCurrentPage(newPage);
    }
  };
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const response = await API.get(`/api/datasets/download/${datasetId}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;

      // Extract filename from response headers or use default
      const contentDisposition = response.headers['content-disposition'];
      let filename = `dataset_${datasetId}.csv`;
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="(.+)"/);
        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error downloading dataset:', err);

      if (err.response && err.response.status === 404) {
        setError(
          'Dataset cannot be downloaded. The annotation is not yet complete. Please ensure all text pairs are annotated before downloading.',
        );
      } else {
        setError('Error downloading dataset. Please try again.');
      }

      // Clear error after 7 seconds (longer for the detailed message)
      setTimeout(() => {
        setError(null);
      }, 7000);
    } finally {
      setExportLoading(false);
    }
  }; // Filtrer les textes en fonction du terme de recherche
  const filteredCoupleTexts = coupleTexts.filter(
    couple =>
      couple.textA.toLowerCase().includes(searchTerm.toLowerCase()) ||
      couple.textB.toLowerCase().includes(searchTerm.toLowerCase()) ||
      couple.trueLabel.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <span className="text-lg text-muted-foreground">
          Loading text pairs...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64 bg-red-50 text-red-700 rounded-md p-4 border border-red-200">
        <p className="font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Entête avec recherche et export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by text or label..."
            className="pl-8"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>{' '}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleExport}
            disabled={exportLoading}
            title="Export dataset"
          >
            {exportLoading ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            {exportLoading ? 'Exporting...' : 'Export'}
          </Button>
        </div>
      </div>{' '}
      {/* Info sur le dataset */}
      {datasetInfo && (
        <div className="bg-muted/40 rounded-lg p-4 flex items-center gap-3">
          <Tag className="h-5 w-5 text-primary" />
          <div className="flex-1">
            <h3 className="font-medium">
              {datasetInfo.name || `Dataset #${datasetId}`}
            </h3>
            <p className="text-sm text-muted-foreground">
              {totalCount || filteredCoupleTexts.length} text pairs
              {datasetInfo.description ? ` • ${datasetInfo.description}` : ''}
            </p>
          </div>
        </div>
      )}
      {/* Table des couples de texte */}
      <div className="rounded-md border shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead className="w-[45%]">Text A</TableHead>
              <TableHead className="w-[45%]">Text B</TableHead>
              <TableHead className="text-right">Label</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCoupleTexts.length > 0 ? (
              filteredCoupleTexts.map(couple => (
                <TableRow key={couple.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium">{couple.id}</TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    <div className="tooltip" title={couple.textA}>
                      {couple.textA}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-[300px] truncate">
                    <div className="tooltip" title={couple.textB}>
                      {couple.textB}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge
                      variant="outline"
                      className={`${getLabelColor(couple.trueLabel)}`}
                    >
                      {couple.trueLabel === 'NOT_YET'
                        ? 'Not Annotated'
                        : couple.trueLabel}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="h-24 text-center text-muted-foreground"
                >
                  No text pairs found matching your criteria
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {/* Pagination */}
      {/* Pagination - toujours visible */}
      <div className="flex items-center justify-end">
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0}
                className={
                  currentPage === 0
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>

            {/* Afficher les pages même s'il n'y en a qu'une seule */}
            {totalPages > 0 &&
              [...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    isActive={index === currentPage}
                    onClick={() => handlePageChange(index)}
                    className="cursor-pointer"
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1 || totalPages <= 1}
                className={
                  currentPage === totalPages - 1 || totalPages <= 1
                    ? 'pointer-events-none opacity-50'
                    : 'cursor-pointer'
                }
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
