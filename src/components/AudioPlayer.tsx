import { useState, useRef } from "react";
import { Play, Pause, Volume2, VolumeX, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent } from "@/components/ui/card";

interface AudioPlayerProps {
  articleText: string;
  title: string;
}

export const AudioPlayer = ({ articleText, title }: AudioPlayerProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(80);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const handlePlayPause = () => {
    if (!window.speechSynthesis) {
      alert("Text-to-speech not supported in this browser");
      return;
    }

    synthRef.current = window.speechSynthesis;

    if (isPlaying) {
      synthRef.current.pause();
      setIsPlaying(false);
    } else {
      if (synthRef.current.paused && utteranceRef.current) {
        synthRef.current.resume();
        setIsPlaying(true);
      } else {
        utteranceRef.current = new SpeechSynthesisUtterance(articleText);
        utteranceRef.current.rate = 1.0;
        utteranceRef.current.pitch = 1.0;
        utteranceRef.current.volume = volume / 100;
        
        utteranceRef.current.onend = () => {
          setIsPlaying(false);
          setProgress(0);
        };

        utteranceRef.current.onboundary = (event) => {
          const progressPercent = (event.charIndex / articleText.length) * 100;
          setProgress(progressPercent);
        };

        synthRef.current.speak(utteranceRef.current);
        setIsPlaying(true);
      }
    }
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setProgress(0);
    }
  };

  const handleVolumeToggle = () => {
    setIsMuted(!isMuted);
    if (utteranceRef.current) {
      utteranceRef.current.volume = isMuted ? volume / 100 : 0;
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    if (utteranceRef.current) {
      utteranceRef.current.volume = newVolume / 100;
    }
    if (newVolume === 0) {
      setIsMuted(true);
    } else if (isMuted) {
      setIsMuted(false);
    }
  };

  return (
    <Card className="bg-card border-border sticky bottom-4 shadow-lg animate-slide-up">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 mr-4">
              <p className="text-sm font-semibold truncate">{title}</p>
              <p className="text-xs text-muted-foreground">News-to-Audio</p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStop}
                disabled={!isPlaying}
                className="h-8 w-8"
              >
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button
                variant="default"
                size="icon"
                onClick={handlePlayPause}
                className="h-10 w-10"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleStop}
                disabled={!isPlaying}
                className="h-8 w-8"
              >
                <SkipForward className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Slider
              value={[progress]}
              max={100}
              step={1}
              className="cursor-default"
              disabled
            />
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleVolumeToggle}
                className="h-8 w-8 flex-shrink-0"
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="h-4 w-4" />
                ) : (
                  <Volume2 className="h-4 w-4" />
                )}
              </Button>
              <Slider
                value={[volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="flex-1"
              />
              <span className="text-xs text-muted-foreground w-8 text-right">{volume}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};