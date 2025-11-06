// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract GaslessNFTMarketplace is ERC721URIStorage, Ownable, ReentrancyGuard {
    uint256 private _tokenIdCounter;

    struct Listing {
        uint256 price;
        address seller;
        bool isListed;
    }

    mapping(uint256 => Listing) public listings;

    event NFTMinted(
        address indexed minter,
        uint256 indexed tokenId,
        string tokenURI
    );
    event NFTListed(
        uint256 indexed tokenId,
        uint256 price,
        address indexed seller
    );
    event NFTSold(
        uint256 indexed tokenId,
        address indexed buyer,
        address indexed seller,
        uint256 price
    );
    event ListingCancelled(uint256 indexed tokenId);

    constructor() ERC721("GaslessNFT", "GNFT") Ownable(msg.sender) {}

    // Mint NFT with metadata
    function mintWithMetadata(
        string memory tokenURI
    ) external returns (uint256) {
        _tokenIdCounter++;
        uint256 newTokenId = _tokenIdCounter;

        _safeMint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);

        emit NFTMinted(msg.sender, newTokenId, tokenURI);
        return newTokenId;
    }

    // List NFT for sale
    function listForSale(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        require(price > 0, "Price must be greater than 0");
        require(!listings[tokenId].isListed, "Already listed");

        listings[tokenId] = Listing({
            price: price,
            seller: msg.sender,
            isListed: true
        });

        emit NFTListed(tokenId, price, msg.sender);
    }

    // Buy NFT
    function buyNFT(uint256 tokenId) external payable nonReentrant {
        Listing memory listing = listings[tokenId];
        require(listing.isListed, "NFT not listed");
        require(msg.value >= listing.price, "Insufficient payment");

        address seller = listing.seller;

        // Remove listing
        delete listings[tokenId];

        // Transfer NFT
        _transfer(seller, msg.sender, tokenId);

        // Transfer payment
        (bool success, ) = payable(seller).call{value: listing.price}("");
        require(success, "Payment failed");

        // Refund excess payment
        if (msg.value > listing.price) {
            (bool refundSuccess, ) = payable(msg.sender).call{
                value: msg.value - listing.price
            }("");
            require(refundSuccess, "Refund failed");
        }

        emit NFTSold(tokenId, msg.sender, seller, listing.price);
    }

    // Cancel listing
    function cancelListing(uint256 tokenId) external {
        require(listings[tokenId].seller == msg.sender, "Not the seller");
        require(listings[tokenId].isListed, "Not listed");

        delete listings[tokenId];
        emit ListingCancelled(tokenId);
    }

    // Get all token IDs owned by an address
    function tokensOfOwner(
        address owner
    ) external view returns (uint256[] memory) {
        uint256 tokenCount = balanceOf(owner);
        uint256[] memory tokenIds = new uint256[](tokenCount);
        uint256 index = 0;

        for (uint256 i = 1; i <= _tokenIdCounter; i++) {
            if (_ownerOf(i) == owner) {
                tokenIds[index] = i;
                index++;
            }
        }

        return tokenIds;
    }

    // Get total minted tokens
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter;
    }
}
