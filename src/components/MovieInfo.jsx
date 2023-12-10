import React, { useEffect } from 'react'
import { useState } from 'react';
import { useParams } from 'react-router-dom';


const MovieInfo = () => {
    const [movie, setMovie] = useState({});
    const params = useParams();
    
    useEffect(() =>{
        fetch(`http://www.omdbapi.com/?apikey=baa21ed6&i=${params.id}`)
        .then(res => res.json())
        .then(data => setMovie(data))
    },[params]);
    return(
        
        <div>
           {movie && (<h1>{movie.Title}</h1>)}
           <img height={500} src={movie && movie.Poster} />
           {movie && (<h2>{movie.Country}</h2>)}
           {movie && (<h2>{movie.Plot}</h2>)}
        </div>
    )
}

export default MovieInfo;