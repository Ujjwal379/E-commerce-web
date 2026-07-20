import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, image }) => {
  const fullTitle = title ? `${title} | ShopEase` : 'ShopEase | Online Shopping';
  const desc = description || 'Shop the latest electronics, fashion and lifestyle products at ShopEase.';
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      {image && <meta property="og:image" content={image} />}
    </Helmet>
  );
};

export default SEO;
