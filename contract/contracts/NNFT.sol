// SPDX-License-Identifier: MIT
pragma solidity ^0.8.2;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract NNFT is ERC721, ERC721Enumerable, ERC721URIStorage, Pausable, Ownable {
  struct Ad {
    uint tokenId;
    uint256 price;
  }

  Ad[] classifieds;

  uint public constant MAX_TOKENS = 3142;

  event AdPlaced(uint tokenId, uint256 price);
  event TokenBought(address from, address to, uint tokenId);
  event Withdrawal();

  constructor() ERC721("NNFT", "NNFT") {}

  function _baseURI() internal pure override returns (string memory) {
    return "https://nnft.club/api/token/";
  }

  function _burn(uint tokenId) internal override(ERC721, ERC721URIStorage) {
    super._burn(tokenId);
  }

  function _beforeTokenTransfer(address from, address to, uint tokenId)
  internal whenNotPaused override(ERC721, ERC721Enumerable) {
    super._beforeTokenTransfer(from, to, tokenId);
  }

  function _getAdIndex(uint tokenId) private view returns (uint) {
    uint index = MAX_TOKENS;

    for (uint i = 0; i < classifieds.length; i++) {
      if (classifieds[i].tokenId == tokenId) {
        index = i;
        break;
      }
    }

    return index;
  }

  function buyToken(uint tokenId) external payable {
    uint index = _getAdIndex(tokenId);

    require(index < MAX_TOKENS, "Token is not for sale");
    require(msg.value >= classifieds[index].price, "Insufficient payment");

    address seller = ownerOf(tokenId);
    uint256 kickback = msg.value / 10;

    (bool priceCall, ) = seller.call{ value: msg.value - kickback }("");
    require(priceCall, "Failed to send ether");

    (bool kickbackCall, ) = address(this).call{ value: kickback }("");
    require(kickbackCall, "Failed to send kickback");

    _transfer(seller, msg.sender, tokenId);
    removeAd(tokenId);

    emit TokenBought(seller, msg.sender, tokenId);
  }

  function contractURI() public pure view returns (string memory) {
    return "https://nnft.club/api/contract";
  }

  function exists(uint tokenId) public view returns (bool) {
    return _exists(tokenId);
  }

  function getAd(uint tokenId) public view returns (uint256) {
    uint index = _getAdIndex(tokenId);

    if (index == MAX_TOKENS) {
      return 0;
    }

    return classifieds[index].price;
  }

  function getBalance() public view returns (uint256) {
    return address(this).balance;
  }

  function pause() public onlyOwner {
    _pause();
  }

  function placeAd(uint tokenId, uint256 price) public {
    require(_exists(tokenId), "Token does not exist");
    require(msg.sender == ownerOf(tokenId), "You don't own this token");
    require(price >= 1e17, "Price is too low (>= 0.1 ETH)");
    Ad memory ad = Ad(tokenId, price);
    classifieds.push(ad);
    emit AdPlaced(tokenId, price);
  }

  function removeAd(uint tokenId) public {
    require(_exists(tokenId), "Token does not exist");
    require(msg.sender == ownerOf(tokenId), "You don't own this token");

    uint index = _getAdIndex(tokenId);
    require(index < MAX_TOKENS, "Token is not for sale");

    delete classifieds[index];
    emit AdPlaced(tokenId, 0);
  }

  function safeMint(address to, uint tokenId) public payable {
    require(tokenId > 0, "Token does not exist");
    require(tokenId <= MAX_TOKENS, "Token does not exist");
    require(msg.value >= 1e17, "Insufficient payment");
    _safeMint(to, tokenId);
  }

  function supportsInterface(bytes4 interfaceId)
  public view override(ERC721, ERC721Enumerable) returns (bool) {
    return super.supportsInterface(interfaceId);
  }

  function tokenURI(uint tokenId)
  public view override(ERC721, ERC721URIStorage)
  returns (string memory) {
    return super.tokenURI(tokenId);
  }

  function unpause() public onlyOwner {
    _unpause();
  }

  function withdraw() public onlyOwner {
    payable(msg.sender).transfer(address(this).balance);
    emit Withdrawal();
  }

  receive() external payable {}
}
