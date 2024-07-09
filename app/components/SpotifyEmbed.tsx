import React from 'react';

const SpotifyEmbed = () => {
  return (
    <iframe
      style={{ borderRadius: '12px' }}
      width="100%"
      height="380"
      title="Spotify Embed: Granite"
      frameBorder="0"
      allowFullScreen
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      src="https://open.spotify.com/embed/track/4mxiv6HQfhqgIuN5iOONQd?si=98a7defab16d47a3&utm_source=oembed"
    />
  );
};

export default SpotifyEmbed;
