import React, {useRef, useState} from "react";
import YouTube from "react-youtube";
import urls from "../../utils/urls";
import movieTrailer from "movie-trailer";
import {useFetchList} from "../../utils/hooks";
import styled from "styled-components";
import {Loader} from "../../utils/style/Atoms";
import ChevronLeft from "../../assets/chevronLeft.png"
import ChevronRight from "../../assets/chevronRight.png"

const RowContainer = styled.div`
    color: white;
    margin-left: 20px;
`
const RowPoster = styled.div`
    display: flex;
    overflow-y: hidden;
    overflow-x: scroll;
    scroll-behavior:smooth;
    padding: 20px;
    ::-webkit-scrollbar {
    display: none;
}
`
const LoaderWrapper = styled.div`
  display: flex;
  justify-content: center;
`


const StyledImage = styled.img`
  object-fit: contain;
  margin-right:  ${({isLargeRow}) => (isLargeRow ? '10px' : '0px')};
  transition: transform 450ms;
  max-height:  ${({isLargeRow}) => (isLargeRow ? '250px' : '100px')};
   &:hover{
      transform:  ${({isLargeRow}) => (isLargeRow ? 'scale(1.15)' : 'scale(1.08)')}; 
  }
`

const Container = styled.div`
  cursor:pointer;
  object-fit: contain;
  width: 100%;
  max-height: 100px;
  margin-right: 10px;
  transition: transform 450ms;
  max-height: 250px;
`

const Chevron = styled.div`
    position: inherit;
    height:${({isLargeRow}) => isLargeRow ? '251px;' : '100px'}; 
    width: 38px;
    margin-top: 20px;
    background: ${({icon}) => 'url(' + icon + ') no-repeat center'};
    background-position: center;
    background-size: contain;
     &:hover{
          opacity:.50;
          -moz-opacity:.50; 
          filter:alpha(opacity=50);         
    }
`

function Row({title, url, isLargeRow}) {
    const myRef = useRef(null);
    const [isOpenL, setIsOpenL] = useState(false);
    const [isOpenR, setIsOpenR] = useState(true);
    const [trailerURL, setTrailerURL] = useState("");
    const {isLoading, data, error} = useFetchList(url);
    const [myVideoId, setMyVideoId] = useState(null);
    const [vidError, setVidError] = useState(true);
    const [isVideoLoading, setIsVideoLoading] = useState(false);
    const movies = data;

    const scrollLeft = function () {
        const leftsize = isLargeRow ? 200 : 250;
        const ec = myRef.current.offsetWidth - myRef.current.scrollLeft;
        if (ec <= myRef.current.offsetWidth * 0.15) {
            setIsOpenR(false);
            setIsOpenL(true);
        } else if (ec <= myRef.current.offsetWidth * 0.40) {
            setIsOpenR(true);
            setIsOpenL(true);
        }
        myRef.current.scrollLeft += leftsize;
    };

    const scrollRight = function () {
        const leftsize = isLargeRow ? 200 : 250;
        const ec = myRef.current.offsetWidth - myRef.current.scrollLeft;
        if (myRef.current.scrollLeft <= leftsize) {
            setIsOpenR(true);
            setIsOpenL(false);
        } else if (ec <= myRef.current.offsetWidth * 0.40) {
            setIsOpenR(true);
            setIsOpenL(true);
        }
        myRef.current.scrollLeft -= leftsize
    };


    if (error) {
        return <span>Oups something went wrong</span>
    }

    const opts = {
        height: "390",
        width: "100%",
        playerVars: {
            autoplay: 1,
        },
    };

    function delay(milliseconds){
        return new Promise(resolve => {
            setTimeout(resolve, milliseconds);
        });
    }

    const resetStateMovie =  async function(){
        // alert('leavbe');
        // await delay(2000);
        setTrailerURL("");
        setVidError(true);
        setIsVideoLoading(false);
    }
    const handleClick = async (movie) => {
        setTrailerURL("");
        setVidError(false);
        setIsVideoLoading(true);
        movieTrailer(movie?.name || movie?.title || movie?.original_title || "")
            .then((url) => {
                const urlParams = new URLSearchParams(new URL(url).search);
                setTrailerURL(urlParams.get("v"));
                setMyVideoId(movie.id)
            })
            .catch((error) => {
                setMyVideoId(null);
                setTrailerURL("");
                setVidError(true);
            })
            .finally((elem) => {
                setIsVideoLoading(false);
            })
    };

    return (
        (isLoading ? (
                <LoaderWrapper data-testid='loader'>
                    <Loader/>
                </LoaderWrapper>
            ) : (
                <RowContainer id="RowContainer">
                    <h2>{title}</h2>
                    {isOpenR ? <Chevron style={{float:'right'}} icon={ChevronRight} onClick={scrollLeft} isLargeRow={isLargeRow}/> : ''}
                    {isOpenL ? <Chevron style={{float:'left'}} icon={ChevronLeft} onClick={scrollRight} isLargeRow={isLargeRow}/> : ''}
                    <RowPoster id="RowPoster" ref={myRef}>
                        {movies && movies.map((movie, index) => (
                            <Container onMouseLeave={() => resetStateMovie(movie)} onClick={() => handleClick(movie)} id="test" key={`${movie.id}'---'`}>
                                    {myVideoId === movie.id && vidError === false ?
                                        (<YouTube
                                                id="vidContainer" style={{width: isLargeRow ? '400px': '300px', height: isLargeRow ? '300px': '100px', marginTop:isLargeRow ? '-123px': '-150px' }}
                                                videoId={trailerURL} opts={opts}/>
                                        ) : (<StyledImage
                                                key={movie.id}
                                                src={`${urls.findImagesUrl}${isLargeRow ? movie.poster_path : movie.backdrop_path}`}
                                                alt={movie.name}
                                                isLargeRow={isLargeRow}
                                            />)
                                    }
                            </Container>
                        ))}
                    </RowPoster>
                </RowContainer>)
        ))
}

export default Row;