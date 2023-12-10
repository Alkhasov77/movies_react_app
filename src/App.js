import React, { useState, useEffect, useCallback } from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Typography from '@mui/material/Typography';
import { Dialog, DialogTitle, DialogActions } from '@mui/material';
import Button from '@mui/material/Button';
import Rating from '@mui/material/Rating';
import Box from '@mui/material/Box';
import StarIcon from '@mui/icons-material/Star';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { green } from '@mui/material/colors';
import { ReadMore } from '@mui/icons-material';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import { Routes, Route, Link } from "react-router-dom";
import MovieInfo from './components/MovieInfo';





const labels = {
  0.5: 'Useless',
  1: 'Useless+',
  1.5: 'Poor',
  2: 'Poor+',
  2.5: 'Ok',
  3: 'Ok+',
  3.5: 'Good',
  4: 'Good+',
  4.5: 'Excellent',
  5: 'Excellent+',
};

function getLabelText(value) {
  return `${value} Star${value !== 1 ? 's' : ''}, ${labels[value]}`;
}


// const useStyles = makeStyles({
//   root: {
//     maxWidth: 400,
//     marginBottom: '20px',
//   },
//   media: {
//     height: 600,
    
//   },
// });

function MovieCard({ movie, onClick }) {
  

  return (
    <Card  sx={{
      maxWidth: 400,
      marginBottom: '20px',
      }}>
      <CardMedia
        sx={{
          
          height: 600,
        }}
        image={movie.Poster}
        title={movie.Title}
      />
      <CardContent>
        <Typography gutterBottom variant="h5" component="div">
          {movie.Title}
        </Typography>
        <Button
         variant="outlined" 
         onClick={() => onClick(movie)} 
         color= "error"
         endIcon={<ReadMore sx={{ color: green[900] }}/>}
         >
          more 
          </Button>
          <Link to={`/movie/${movie.imdbID}`}>Перейти</Link> 
      </CardContent>
    </Card>
  );
}

function Search({ text, setText, onSearch }) {
  const handleInputChange = (e) => setText(e.target.value);

  return (
    <>
      <input value={text} onChange={handleInputChange} />
    </>
  );
}

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}




function MovieList() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('Marvel');
  const [loading, setLoading] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState();
  const [isFindIndex, setIsFindIndex] = useState(false);
  const [isLastIndex, setIsLastIndex] = useState(false);
  const [value, setValue] = useState(0);
  const [hover, setHover] = useState(-1);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    const isLiked = localStorage.getItem(`likedmovie_${selectedMovie?.imdbID}`);
    if (Boolean(isLiked)) {
      setLiked(true);
    } else {
      setLiked(false);
    }
    
    
  },[selectedMovie]);

  const handleLiked = useCallback(() => {
  if (liked) {
    setLiked(false);
    localStorage.setItem(`likedmovie_${selectedMovie?.imdbID}`, false);
  } else {
    setLiked(true);
    localStorage.setItem(`likedmovie_${selectedMovie?.imdbID}`, true);
  }
  },[selectedMovie, liked])
  
  useEffect(() => {
    const storedRating = localStorage.getItem(`movieRating_${selectedMovie?.imdbID}`);
    if (storedRating) {
      setValue(parseFloat(storedRating));
    }
  }, [selectedMovie]); 

  useEffect(() => {
    if (selectedMovie && value) {
      localStorage.setItem(`movieRating_${selectedMovie.imdbID}`, value);
    }
  }, [selectedMovie, value]); 

  useEffect(() => {
    setIsFindIndex(false);
    setIsLastIndex(false);

    if (!selectedMovie) {
      return;
    }
    
    const index = movies.indexOf(selectedMovie);
    

    if (index === 0) {
      setIsFindIndex(true);
    } else if (index === movies.length - 1) {
      setIsLastIndex(true);
    }
  }, [selectedMovie, movies]);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const handlePrevious = useCallback(() => {
    const index = movies.indexOf(selectedMovie);
    

    

    setSelectedMovie(movies[index - 1]);
}, [movies, selectedMovie, setSelectedMovie]);

const handleNext = useCallback(() => {
    const index = movies.indexOf(selectedMovie);
   

    setSelectedMovie(movies[index + 1]);
    
}, [movies, selectedMovie, setSelectedMovie]);

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);
        const apiKey = 'baa21ed6';
        const response = await fetch(`http://www.omdbapi.com/?s=${debouncedSearchTerm}&apikey=${apiKey}`);
        const data = await response.json();
        
        if (data.Search && data.Search.length > 0) {
          setMovies(data.Search);
          setSelectedMovie(data.Search[0]);
        } else {
          setMovies([]);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching movies:', error);
        setLoading(false);
      }
    }

    
      fetchMovies();

  }, [debouncedSearchTerm]);

  return (
    <div>
      
    <Search text={searchTerm} setText={setSearchTerm} />
      {loading ? (
        <div>
          Данные загружаются...
        </div>
      ) : movies.length === 0 ? (
        <div>Нет результатов</div>
      ) : (
        movies.map((movie, index) => <MovieCard onClick={x => setSelectedMovie(x)} key={index} movie={movie} />)
      )}
      <Dialog onClose={() => setSelectedMovie(null)} open={selectedMovie}>
        <DialogTitle>
          {selectedMovie && selectedMovie.Title}
          <div>{selectedMovie && movies.indexOf(selectedMovie) + 1} из {movies.length}</div>
          {liked ?
          <FavoriteBorderIcon onClick={handleLiked} sx={{ color: "red" }} /> : <FavoriteBorderIcon onClick={handleLiked} />
          } 
        </DialogTitle>
        <img height={500} src={selectedMovie && selectedMovie.Poster} />
        <DialogActions>
        <Box
          sx={{
            width: 200,
            display: 'flex',
            alignItems: 'center',
      }}
    >
        <Rating
          name="hover-feedback"
          value={value}
          precision={0.5}
          getLabelText={getLabelText}
          onChange={(event, newValue) => {
            setValue(newValue);
          }}
          onChangeActive={(event, newHover) => {
            setHover(newHover);
          }}
          emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
        />
        {value !== null && (
          <Box sx={{ ml: 2 }}>{labels[hover !== -1 ? hover : value]}</Box>
        )}
          </Box>
          <Button onClick={handlePrevious} disabled={isFindIndex}>Previous</Button>
          <Button onClick={handleNext} disabled={isLastIndex}>Next</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}



function App() {
  return (
    <div>
      <Box sx={{ flexGrow: 1 }}>
    <AppBar position="static">
      <Toolbar variant="dense">
        <IconButton edge="start" color="inherit" aria-label="menu" sx={{ mr: 2 }}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" color="inherit" component="div">
          Photos
        </Typography>
      </Toolbar>
    </AppBar>
  </Box>
  <Routes>
  <Route path="/" element={<MovieList/>} />
  <Route path="/movie/:id" element={<MovieInfo />} />
  <Route path="*" element={<MovieList />} />
  </Routes>
    </div>
  );
}

export default App;