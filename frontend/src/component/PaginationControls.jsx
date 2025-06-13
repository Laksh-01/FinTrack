import React from 'react';
import { Button } from '../../components/ui/button'; // Assuming you use shadcn/ui buttons
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * A reusable component for displaying pagination controls.
 * @param {object} props
 * @param {number} props.currentPage - The current active page number.
 * @param {number} props.totalPages - The total number of pages available.
 * @param {function} props.onPageChange - A callback function that is called with the new page number when a button is clicked.
 */
const PaginationControls = ({ currentPage, totalPages, onPageChange }) => {
  // Determine if the Previous and Next buttons should be clickable
  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  // Don't render anything if there's only one page
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-center space-x-4 ">
      <Button
        variant="outline"
        size="sm"
        // When clicked, call the parent's function with the previous page number
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>

      <span className="text-sm font-medium text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        size="sm"
        // When clicked, call the parent's function with the next page number
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
};

export default PaginationControls;