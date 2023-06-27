import { Component, OnInit, inject} from '@angular/core';
import { NgForm } from '@angular/forms';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { TrainingService } from '../training.service';
import { Exercise } from '../exercise.model';

@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit{
  db: Firestore = inject(Firestore)
  exercises: Observable<any>

  constructor(private trainingService: TrainingService) {}

  ngOnInit(): void {
    // this.exercises = this.trainingService.getAvailableExercises();
    const aCollection = collection(this.db, 'availableExercises');
    // collectionData(aCollection, {idField: 'id'}).subscribe(result =>{
    //   console.log(result)
    // })
    this.exercises = collectionData(aCollection, {idField: 'id'});
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise);
  }

}
