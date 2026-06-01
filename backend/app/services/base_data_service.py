# Abstract base for all data-source services: defines the RawSignal dataclass and the search() contract.
# 所有数据源 Service 的抽象基类：定义 RawSignal 数据结构和 search() 接口规范。
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
