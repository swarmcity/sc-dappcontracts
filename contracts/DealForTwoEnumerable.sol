pragma solidity ^0.4.11;
/// [KF] Added "inprogress"
contract DealForTwoEnumerable {

   	enum DealStatuses {
  	Open,
    Inprogress,
      Done,
      Disputed,
      Resolved,
      Cancelled
   	}
}
