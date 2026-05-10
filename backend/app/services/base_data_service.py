from abc import ABC, abstractmethod
from dataclasses import dataclass


@dataclass
class RawSignal:
    title: str
    url: str
    source: str  # "github" | "hackernews" | "reddit"
    body: str = ""
    score: int = 0  # stars, upvotes, reactions — used for quality sorting


class BaseDataService(ABC):
    @abstractmethod
    async def search(self, keywords: list[str]) -> list[RawSignal]:
        """Search for signals matching keywords.
        Contract: never raises — returns [] on any external failure.
        """
        ...
