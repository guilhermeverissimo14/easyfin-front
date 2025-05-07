export function LoadingSpinner() {
    return (
        <div className="flex h-full w-full items-center justify-center p-10">
           <div className="h-16 w-16 animate-spin rounded-full border-4 border-gray-300 border-t-primary"></div>
        </div>
     );
}