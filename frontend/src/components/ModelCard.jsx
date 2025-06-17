import React, { useState, useEffect, useRef } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import '@google/model-viewer';

// --- Constants ---
const CARD_WIDTH = 345;
const CARD_HEIGHT = 300;
const IMAGE_HEIGHT = '200px';
const FALLBACK_IMAGE_URL = '/images/Modell1.png';

// --- Helper Component for Error State ---
const ErrorCard = React.forwardRef((props, ref) => (
  <Card
    ref={ref}
    sx={{
      width: CARD_WIDTH,
      height: CARD_HEIGHT,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#f8d7da',
      border: '1px solid #f5c6cb',
    }}
  >
    <CardContent>
      <Typography gutterBottom variant="h6" component="div" color="error">
        Error
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Could not load model details.
      </Typography>
    </CardContent>
  </Card>
));
ErrorCard.displayName = 'ErrorCard';

// --- Helper Component for Image Display ---
const ModelImage = ({ src, alt, fallbackSrc }) => {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      src={imgSrc}
      alt={alt}
      style={{ width: '100%', height: IMAGE_HEIGHT, objectFit: 'cover' }}
      onError={() => setImgSrc(fallbackSrc)}
    />
  );
};

// --- Helper Component for 3D Model Display ---
const Model3D = ({ modelSrc, posterSrc, alt }) => (
  <model-viewer
    src={modelSrc}
    poster={posterSrc}
    alt={alt}
    auto-rotate
    auto-rotate-delay="500"
    rotation-per-second="0.05turn"
    interaction-prompt="none"
    style={{ width: '100%', height: IMAGE_HEIGHT }}
  />
);

// --- Custom Hook for Intersection Observer ---
const useInView = (options) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  const memoizedOptions = React.useMemo(() => options, [options]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.disconnect();
      }
    }, memoizedOptions);

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [options]);

  return [ref, inView];
};

// --- Main ModelCard Component ---
export default function ModelCard({ model, onSelectModel }) {
  const [ref, inView] = useInView({ rootMargin: '100px' });
  const [hover, setHover] = useState(false);

  // --- Render Logic ---

  if (!inView) {
    return <Skeleton ref={ref} variant="rectangular" width={CARD_WIDTH} height={CARD_HEIGHT} />;
  }

  if (!model) {
    return <ErrorCard ref={ref} />;
  }

  const model3dUrl = `/models/Modell${model.ModellID}.glb`;
  const imageUrl = `/images/Modell${model.ModellID}.png`;

  return (
    <Card
      ref={ref}
      sx={{
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        transition: 'transform 0.3s',
        transform: hover ? 'scale(1.03)' : 'scale(1)',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {hover ? (
        <Model3D modelSrc={model3dUrl} posterSrc={imageUrl} alt={model.ModellName} />
      ) : (
        <ModelImage src={imageUrl} fallbackSrc={FALLBACK_IMAGE_URL} alt={model.ModellName} />
      )}

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="div" noWrap>
          {model.ModellName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          From €{model.Stundenpreis?.toFixed(2) || 'N/A'} / hour
        </Typography>
      </CardContent>

      <CardActions>
        <Button size="small" onClick={onSelectModel}>
          Select Model
        </Button>
      </CardActions>
    </Card>
  );
}