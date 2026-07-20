const Loader = ({ full = false }) => (
  <div className={`flex items-center justify-center ${full ? 'min-h-[60vh]' : 'py-10'}`}>
    <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
  </div>
);

export default Loader;
