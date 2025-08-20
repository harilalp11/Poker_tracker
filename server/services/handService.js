const Hand = require('../models/Hand');
const Session = require('../models/Session');

class HandService {
  // Create a new hand
  static async createHand(sessionId, handData) {
    console.log('HandService: Creating hand for session:', sessionId);
    console.log('HandService: Hand data received:', JSON.stringify(handData, null, 2));
    console.log('HandService: holeCards field specifically:', handData.holeCards);
    console.log('HandService: holeCards type:', typeof handData.holeCards);
    console.log('HandService: holeCards is array:', Array.isArray(handData.holeCards));
    console.log('HandService: holeCards length:', handData.holeCards ? handData.holeCards.length : 'undefined');

    try {
      // Validate session exists
      const session = await Session.findById(sessionId);
      if (!session) {
        console.log('HandService: Session not found:', sessionId);
        throw new Error('Session not found');
      }

      console.log('HandService: Session found before hand creation:', {
        _id: session._id,
        profit: session.profit,
        handsPlayed: session.handsPlayed,
        profitType: typeof session.profit,
        handsPlayedType: typeof session.handsPlayed
      });

      // Generate handNumber (next sequential number for this session)
      const existingHands = await Hand.find({ sessionId }).countDocuments();
      const handNumber = existingHands + 1;
      console.log('HandService: Generated handNumber:', handNumber);

      // Transform communityCards from object to flat array
      let communityCardsArray = [];
      if (handData.communityCards) {
        console.log('HandService: Original communityCards:', JSON.stringify(handData.communityCards, null, 2));
        
        // Add flop cards
        if (handData.communityCards.flop && Array.isArray(handData.communityCards.flop)) {
          communityCardsArray = [...communityCardsArray, ...handData.communityCards.flop];
        }
        
        // Add turn card
        if (handData.communityCards.turn) {
          communityCardsArray.push(handData.communityCards.turn);
        }
        
        // Add river card
        if (handData.communityCards.river) {
          communityCardsArray.push(handData.communityCards.river);
        }
        
        console.log('HandService: Transformed communityCards to array:', communityCardsArray);
      }

      // Validate holeCards before creating hand
      if (!handData.holeCards || !Array.isArray(handData.holeCards) || handData.holeCards.length !== 2) {
        console.error('HandService: Invalid holeCards provided:', handData.holeCards);
        throw new Error('Hole cards must be an array with exactly 2 cards');
      }

      console.log('HandService: holeCards validation passed:', handData.holeCards);

      // Create the hand with proper data structure
      const handToCreate = {
        sessionId,
        userId: handData.userId,
        handNumber: handNumber,
        position: handData.position,
        holeCards: handData.holeCards || [],
        communityCards: communityCardsArray, // Use flat array instead of object
        actions: handData.actions || [],
        result: handData.result || 0,
        tags: handData.tags || [],
        importance: handData.importance || 1,
        notes: handData.notes || ''
      };

      console.log('HandService: Hand object to create:', JSON.stringify(handToCreate, null, 2));
      console.log('HandService: Final holeCards before save:', handToCreate.holeCards);
      console.log('HandService: Final holeCards length before save:', handToCreate.holeCards.length);

      const hand = new Hand(handToCreate);

      console.log('HandService: Hand object before save:', JSON.stringify(hand, null, 2));
      console.log('HandService: Hand result field:', hand.result, 'type:', typeof hand.result);
      console.log('HandService: Hand holeCards before save:', hand.holeCards);

      const savedHand = await hand.save();
      console.log('HandService: Hand saved successfully:', {
        _id: savedHand._id,
        sessionId: savedHand.sessionId,
        handNumber: savedHand.handNumber,
        result: savedHand.result,
        resultType: typeof savedHand.result,
        position: savedHand.position,
        holeCards: savedHand.holeCards
      });

      // Update session statistics
      console.log('HandService: Starting session statistics update...');
      const handResult = savedHand.result || 0;
      console.log('HandService: Hand result for session update:', handResult, 'type:', typeof handResult);

      // Calculate new session profit and hands played
      const currentProfit = session.profit || 0;
      const currentHandsPlayed = session.handsPlayed || 0;
      const newProfit = currentProfit + handResult;
      const newHandsPlayed = currentHandsPlayed + 1;

      console.log('HandService: Session profit calculation details:');
      console.log('HandService: - Current session profit:', currentProfit, 'type:', typeof currentProfit);
      console.log('HandService: - Hand result to add:', handResult, 'type:', typeof handResult);
      console.log('HandService: - Calculated new profit:', newProfit, 'type:', typeof newProfit);
      console.log('HandService: - Current hands played:', currentHandsPlayed);
      console.log('HandService: - New hands played:', newHandsPlayed);

      console.log('HandService: About to update session with:', {
        sessionId: sessionId,
        updateData: {
          profit: newProfit,
          handsPlayed: newHandsPlayed
        }
      });

      const updatedSession = await Session.findByIdAndUpdate(
        sessionId,
        {
          profit: newProfit,
          handsPlayed: newHandsPlayed
        },
        { new: true }
      );

      if (!updatedSession) {
        console.error('HandService: Session update returned null - session may not exist');
        throw new Error('Failed to update session - session not found');
      }

      console.log('HandService: Session updated successfully:', {
        _id: updatedSession._id,
        profit: updatedSession.profit,
        handsPlayed: updatedSession.handsPlayed,
        profitType: typeof updatedSession.profit,
        handsPlayedType: typeof updatedSession.handsPlayed
      });

      // Verify the update by fetching the session again
      const verificationSession = await Session.findById(sessionId);
      console.log('HandService: Session verification after update:', {
        _id: verificationSession._id,
        profit: verificationSession.profit,
        handsPlayed: verificationSession.handsPlayed,
        profitType: typeof verificationSession.profit,
        handsPlayedType: typeof verificationSession.handsPlayed
      });

      return savedHand;
    } catch (error) {
      console.error('HandService: Error creating hand:', error);
      console.error('HandService: Error stack:', error.stack);
      throw new Error(`Failed to create hand: ${error.message}`);
    }
  }

  // Get all hands for a session
  static async getHandsBySession(sessionId) {
    console.log('HandService: Getting hands for session:', sessionId)
    try {
      const hands = await Hand.find({ sessionId }).sort({ createdAt: -1 });
      console.log('HandService: Found hands:', hands.length);

      // Log each hand's structure for debugging community cards
      hands.forEach((hand, index) => {
        console.log(`HandService: Hand ${index + 1} data structure:`, {
          _id: hand._id,
          handNumber: hand.handNumber,
          result: hand.result,
          resultType: typeof hand.result,
          position: hand.position,
          createdAt: hand.createdAt,
          communityCards: hand.communityCards,
          communityCardsType: typeof hand.communityCards,
          communityCardsIsArray: Array.isArray(hand.communityCards),
          communityCardsLength: hand.communityCards?.length,
          holeCards: hand.holeCards,
          fullHandObject: JSON.stringify(hand.toObject(), null, 2)
        });
      });

      // Calculate total profit from hands for verification
      const totalProfitFromHands = hands.reduce((sum, hand) => sum + (hand.result || 0), 0);
      console.log('HandService: Total profit calculated from hands:', totalProfitFromHands);

      return hands;
    } catch (error) {
      console.error('HandService: Error getting hands:', error);
      throw new Error(`Failed to get hands: ${error.message}`);
    }
  }

  // Get a single hand by ID
  static async getHandById(handId) {
    console.log('HandService: Getting hand by ID:', handId);
    try {
      const hand = await Hand.findById(handId);
      if (!hand) {
        console.log('HandService: Hand not found:', handId);
        throw new Error('Hand not found');
      }

      console.log('HandService: Hand found:', {
        _id: hand._id,
        sessionId: hand.sessionId,
        handNumber: hand.handNumber,
        result: hand.result,
        position: hand.position
      });

      return hand;
    } catch (error) {
      console.error('HandService: Error getting hand by ID:', error);
      throw new Error(`Failed to get hand: ${error.message}`);
    }
  }

  // Update a hand
  static async updateHand(handId, updateData) {
    console.log('HandService: Updating hand:', handId);
    console.log('HandService: Update data:', JSON.stringify(updateData, null, 2));

    try {
      const hand = await Hand.findByIdAndUpdate(handId, updateData, { new: true });
      if (!hand) {
        console.log('HandService: Hand not found for update:', handId);
        throw new Error('Hand not found');
      }

      console.log('HandService: Hand updated successfully:', {
        _id: hand._id,
        handNumber: hand.handNumber,
        result: hand.result,
        position: hand.position
      });

      return hand;
    } catch (error) {
      console.error('HandService: Error updating hand:', error);
      throw new Error(`Failed to update hand: ${error.message}`);
    }
  }

  // Delete a hand
  static async deleteHand(handId) {
    console.log('HandService: Deleting hand:', handId);
    try {
      const hand = await Hand.findById(handId);
      if (!hand) {
        console.log('HandService: Hand not found for deletion:', handId);
        throw new Error('Hand not found');
      }

      console.log('HandService: Hand found for deletion:', {
        _id: hand._id,
        sessionId: hand.sessionId,
        handNumber: hand.handNumber,
        result: hand.result
      });

      // Get session to update statistics
      const session = await Session.findById(hand.sessionId);
      if (session) {
        console.log('HandService: Session before hand deletion:', {
          profit: session.profit,
          handsPlayed: session.handsPlayed
        });

        const handResult = hand.result || 0;
        const newProfit = (session.profit || 0) - handResult;
        const newHandsPlayed = Math.max((session.handsPlayed || 0) - 1, 0);

        console.log('HandService: Session profit calculation for deletion:');
        console.log('HandService: - Current session profit:', session.profit);
        console.log('HandService: - Hand result to subtract:', handResult);
        console.log('HandService: - New session profit:', newProfit);
        console.log('HandService: - New hands played:', newHandsPlayed);

        await Session.findByIdAndUpdate(
          hand.sessionId,
          {
            profit: newProfit,
            handsPlayed: newHandsPlayed
          }
        );

        console.log('HandService: Session updated after hand deletion');
      }

      await Hand.findByIdAndDelete(handId);
      console.log('HandService: Hand deleted successfully');

      return { message: 'Hand deleted successfully' };
    } catch (error) {
      console.error('HandService: Error deleting hand:', error);
      throw new Error(`Failed to delete hand: ${error.message}`);
    }
  }
}

module.exports = HandService;